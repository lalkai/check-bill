import Tesseract from 'tesseract.js';

let worker = null;
let isInitializing = false;
let lastProgress = 0;
let currentOnProgress = null;

async function getWorker() {
    if (worker) return worker;

    if (isInitializing) {
        while (isInitializing) {
            await new Promise(r => setTimeout(r, 100));
        }
        return worker;
    }

    isInitializing = true;

    try {
        const corePath = 'https://cdn.jsdelivr.net/npm/tesseract.js-core@7.0.0/tesseract-core-simd-lstm.wasm.js';

        worker = await Tesseract.createWorker('tha+eng', Tesseract.OEM.LSTM_ONLY, {
            corePath,
            langPath: 'https://tessdata.projectnaptha.com/4.0.0_best',
            logger: (m) => {
                if (currentOnProgress) {
                    let p = 0;
                    // แสดง progress เฉพาะตอน recognize (ตอนโหลดโมเดลให้เป็น 0%)
                    if (m.status === 'recognizing text') {
                        p = Math.round(m.progress * 100);
                    }

                    if (p !== lastProgress && (p - lastProgress >= 5 || p === 100 || p === 0)) {
                        lastProgress = p;
                        currentOnProgress({ status: 'กำลังประมวลผล...', progress: p });
                    }
                }
            }
        });

        await worker.setParameters({
            tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
            preserve_interword_spaces: '1',
        });

        return worker;
    } catch (error) {
        worker = null;
        throw error;
    } finally {
        isInitializing = false;
    }
}

export async function terminateWorker() {
    if (worker) {
        await worker.terminate();
        worker = null;
    }
}

export async function recognizeReceipt(imageFile, onProgress) {
    currentOnProgress = onProgress;
    lastProgress = 0;
    if (onProgress) onProgress({ status: 'กำลังประมวลผล...', progress: 0 });

    const ocrWorker = await getWorker();

    // Reset progress หลังจากโหลด worker เสร็จ
    lastProgress = 0;
    if (onProgress) onProgress({ status: 'กำลังประมวลผล...', progress: 0 });

    const { data } = await ocrWorker.recognize(imageFile);

    if (onProgress) onProgress({ status: 'กำลังวิเคราะห์ผลลัพธ์...', progress: 100 });

    const items = parseReceiptText(data.text);

    return { text: data.text, confidence: data.confidence, items };
}

function parseReceiptText(text) {
    if (!text || !text.trim()) return [];

    const items = [];
    const lines = text.split(/\r?\n/);

    for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine || cleanLine.length < 2) continue;
        if (isHeaderOrFooter(cleanLine)) continue;

        const parsed = extractItemAndPrice(cleanLine);
        if (parsed) {
            items.push({ description: parsed.description, amount: parsed.amount, selected: true });
        }
    }

    return items;
}

function isHeaderOrFooter(line) {
    const patterns = [
        /^(ใบเสร็จ|ใบกำกับ|สาขา|ที่อยู่|โทร|tel|tax|vat|เลขที่|วันที่|เวลา|พนักงาน)/i,
        /^(receipt|invoice|date|time|cashier|store|address|phone|thank|total|subtotal|sub-total|grand|change|cash|card|visa|master|net|qty|amount|item|description|tax id)/i,
        /^[-=*_]{3,}$/,
        /^[.\s]{3,}$/,
        /^\d{4,}$/,
        /^\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}$/,
        /^(รวม|ยอดรวม|ทั้งหมด|ส่วนลด|discount|ภาษี|เงินทอน|ชำระ|เงินสด|บัตร|รับ)/i,
    ];
    return patterns.some(p => p.test(line));
}

function extractItemAndPrice(line) {
    const priceAtEnd = line.match(/^(.+?)\s{2,}(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)\s*$/);
    if (priceAtEnd) {
        const desc = cleanDescription(priceAtEnd[1]);
        const amount = parsePrice(priceAtEnd[2]);
        if (desc && amount > 0) return { description: desc, amount };
    }

    const qtyPattern = line.match(/^\d+\s*[xX×]\s*(.+?)\s+(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)\s*$/);
    if (qtyPattern) {
        const desc = cleanDescription(qtyPattern[1]);
        const amount = parsePrice(qtyPattern[2]);
        if (desc && amount > 0) return { description: desc, amount };
    }

    const dotsPattern = line.match(/^(.+?)[.\-_]{2,}\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)\s*$/);
    if (dotsPattern) {
        const desc = cleanDescription(dotsPattern[1]);
        const amount = parsePrice(dotsPattern[2]);
        if (desc && amount > 0) return { description: desc, amount };
    }

    const fallback = line.match(/^(.+?)\s+(\d{1,3}(?:,\d{3})*\.\d{2})\s*$/);
    if (fallback) {
        const desc = cleanDescription(fallback[1]);
        const amount = parsePrice(fallback[2]);
        if (desc && desc.length >= 2 && amount > 0) return { description: desc, amount };
    }

    return null;
}

function cleanDescription(desc) {
    return desc
        .replace(/^[\d]+[.\s)]+/, '')
        .replace(/\s+/g, ' ')
        .replace(/[.*_\-]+$/, '')
        .trim();
}

function parsePrice(priceStr) {
    const num = parseFloat(priceStr.replace(/,/g, ''));
    return isNaN(num) ? 0 : num;
}
