export async function preprocessImage(imageFile) {
  const img = await loadImageFromFile(imageFile);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  let scale = Math.min(Math.max(1, 1000 / img.width), 3);
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  imageData = toGrayscale(imageData);
  imageData = enhanceContrast(imageData, 1.5);
  imageData = sharpen(imageData, canvas.width, canvas.height);
  imageData = otsuBinarize(imageData);
  ctx.putImageData(imageData, 0, 0);

  return canvas;
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("ไม่สามารถโหลดรูปภาพได้"));
    };
    img.src = url;
  });
}

function toGrayscale(imageData) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = data[i + 1] = data[i + 2] = gray;
  }
  return imageData;
}

function enhanceContrast(imageData, factor) {
  const data = imageData.data;
  let min = 255,
    max = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] < min) min = data[i];
    if (data[i] > max) max = data[i];
  }
  const range = max - min || 1;
  for (let i = 0; i < data.length; i += 4) {
    let val = ((data[i] - min) / range) * 255;
    val = Math.max(0, Math.min(255, (val - 128) * factor + 128));
    data[i] = data[i + 1] = data[i + 2] = val;
  }
  return imageData;
}

// Sharpen — 3x3 convolution
function sharpen(imageData, width, height) {
  const src = new Uint8ClampedArray(imageData.data);
  const dst = imageData.data;
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sum = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          sum +=
            src[((y + ky) * width + (x + kx)) * 4] *
            kernel[(ky + 1) * 3 + (kx + 1)];
        }
      }
      const idx = (y * width + x) * 4;
      const val = Math.max(0, Math.min(255, sum));
      dst[idx] = dst[idx + 1] = dst[idx + 2] = val;
    }
  }
  return imageData;
}

// Otsu's binarization
function otsuBinarize(imageData) {
  const data = imageData.data;
  const histogram = new Array(256).fill(0);
  for (let i = 0; i < data.length; i += 4) histogram[data[i]]++;

  const totalPixels = data.length / 4;
  let sumAll = 0;
  for (let i = 0; i < 256; i++) sumAll += i * histogram[i];

  let sumBg = 0,
    weightBg = 0,
    maxVariance = 0,
    threshold = 0;

  for (let t = 0; t < 256; t++) {
    weightBg += histogram[t];
    if (weightBg === 0) continue;
    const weightFg = totalPixels - weightBg;
    if (weightFg === 0) break;

    sumBg += t * histogram[t];
    const meanBg = sumBg / weightBg;
    const meanFg = (sumAll - sumBg) / weightFg;
    const variance = weightBg * weightFg * (meanBg - meanFg) ** 2;

    if (variance > maxVariance) {
      maxVariance = variance;
      threshold = t;
    }
  }

  for (let i = 0; i < data.length; i += 4) {
    const val = data[i] >= threshold ? 255 : 0;
    data[i] = data[i + 1] = data[i + 2] = val;
  }
  return imageData;
}
