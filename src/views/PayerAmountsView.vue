<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useBillStore } from "../stores/Bills";
import { usePeopleStore } from "../stores/People";
import generatePayload from "promptpay-qr";
import qrcode from "qrcode";
import html2canvas from "html2canvas-pro";

const billStore = useBillStore();
const peopleStore = usePeopleStore();
const selectedDate = ref(null);

const filteredPayerAmounts = computed(() => {
  const amounts = billStore.payerAmounts;
  const peopleList = peopleStore.list;

  return Object.entries(amounts).map(([name, dates]) => {
    const person = peopleList.find((person) => person.name === name);
    const filteredDates = selectedDate.value
      ? { [selectedDate.value]: dates[selectedDate.value] || 0 }
      : dates;
    const totalAmountDue = Object.values(filteredDates).reduce(
      (acc, amount) => acc + amount,
      0
    );
    return {
      name,
      dates: filteredDates || {},
      paid: person ? person.paid : false,
      totalAmountDue,
    };
  });
});

const inputPromptpay = ref("");
const showAddQrCodePopup = ref(false);
const showQrCode = ref(false);

const generateQRCode = async () => {
  if (!inputPromptpay.value) {
    alert("โปรดป้อนข้อมูลให้ครบ!");
    return;
  }

  showQrCode.value = true;
  localStorage.setItem("promptpayID", inputPromptpay.value);

  const amount = 0;
  const promptNumber = inputPromptpay.value;
  const payload = generatePayload(promptNumber, { amount });
  const opts = {
    type: "image/png",
    margin: 1,
    width: 180,
  };

  await nextTick();

  const canvas = document.createElement("canvas");
  qrcode.toCanvas(canvas, payload, opts, (err) => {
    if (err) console.log("Error generating QR Code: ", err);
    const canvasContainer = document.getElementById("qrcode-img-container");
    if (canvasContainer) {
      canvas.id = "qrcode-img";
      canvas.className = "rounded-2xl";
      canvasContainer.innerHTML = "";
      canvasContainer.appendChild(canvas);
    } else {
      console.error("Canvas container element not found!");
    }
  });

  const promptpayIDElement = document.getElementById("PromptpayID");
  if (promptpayIDElement) {
    promptpayIDElement.textContent = promptNumber;
  } else {
    console.error("PromptpayID element not found!");
  }

  showAddQrCodePopup.value = false;
};

const deleteQRCode = () => {
  localStorage.removeItem("promptpayID");
  inputPromptpay.value = "";

  const img = document.getElementById("qrcode-img-img");
  if (img) {
    img.remove();
  }

  const canvasContainer = document.getElementById("qrcode-img-container");
  if (canvasContainer) {
    canvasContainer.innerHTML = '<canvas id="qrcode-img" class="rounded-2xl"></canvas>';
  }

  const promptpayIDElement = document.getElementById("PromptpayID");
  if (promptpayIDElement) {
    promptpayIDElement.textContent = "";
  }

  showQrCode.value = false;
};

const capturePage = async () => {
  try {
    await nextTick();

    const mainContent = document.querySelector('main');

    if (!mainContent) {
      throw new Error('Main content element not found.');
    }

    const canvas = await html2canvas(mainContent, {
      useCORS: true,
      scale: window.devicePixelRatio,
      logging: true,
      allowTaint: true,
      foreignObjectRendering: true,
      ignoreElements: (element) => {
        return window.getComputedStyle(element).display === "none" || 
               element.classList.contains('sm:hidden') ||
               element.tagName === 'NAV';
      },
      onclone: (clonedDoc) => {
        Array.from(
          clonedDoc.querySelectorAll(".modal, .dropdown, .tooltip")
        ).forEach((el) => {
          el.style.display = "block";
          el.style.opacity = "1";
          el.style.visibility = "visible";
        });
        
        const bottomNav = clonedDoc.querySelector('.fixed.bottom-0.inset-x-0');
        if (bottomNav) {
          bottomNav.style.display = "none";
        }
      },
    });

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "สรุปยอดบิล.png";
          link.click();
          URL.revokeObjectURL(link.href);
        }
      },
      "image/png",
      1.0
    );
  } catch (error) {
    console.error("Error capturing page:", error);
  }
};

onMounted(() => {
  const storedPromptpayID = localStorage.getItem("promptpayID");
  if (storedPromptpayID) {
    inputPromptpay.value = storedPromptpayID;
    generateQRCode();
  }
});

const togglePaymentStatus = (payer, date) => {
  peopleStore.togglePaidStatus(payer.name, date);
};
</script>

<template>
  <div>
    <!-- Summary Tools -->
    <div class="a-card mb-6">
      <h2 class="a-header">เครื่องมือ</h2>
      <div class="flex flex-wrap gap-3 justify-center">
        <button @click="showAddQrCodePopup = true" class="a-button-primary flex-grow sm:flex-grow-0">
          <div class="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
            </svg>
            ใส่พร้อมเพย์
          </div>
        </button>
        
        <button @click="deleteQRCode" class="a-button-secondary flex-grow sm:flex-grow-0">
          <div class="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
            ลบ QR Code
          </div>
        </button>
        
        <button @click="capturePage" class="a-button-primary flex-grow sm:flex-grow-0">
          <div class="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            ดาวน์โหลด
          </div>
        </button>
      </div>
    </div>
    
    <!-- QR Code Display Card -->
    <div v-if="showQrCode" class="a-card mb-6">
      <div class="flex flex-col items-center">
        <h3 class="text-lg font-medium text-neutral-700 mb-4">PromptPay QR Code</h3>
        <div class="mb-4 bg-white p-4 rounded-2xl shadow-a" id="qrcode-img-container">
          <canvas id="qrcode-img" class="rounded-2xl"></canvas>
        </div>
        <div class="flex items-center text-neutral-600">
          <span class="text-sm mr-1">PromptPay ID:</span>
          <span id="PromptpayID" class="font-medium"></span>
        </div>
      </div>
    </div>

    <!-- Payer Amounts List -->
    <div class="space-y-4">
      <div
        v-for="(payer, index) in filteredPayerAmounts"
        :key="index"
        class="a-card transition-all duration-300"
      >
        <div class="flex flex-col sm:flex-row justify-between sm:items-start gap-2 sm:gap-0">
          <div>
            <h2 class="text-lg font-semibold text-neutral-700 break-words">{{ payer.name }}</h2>
            <p class="text-lg font-medium mt-1">
              ยอดรวม: <span class="text-primary">{{ payer.totalAmountDue.toFixed(2) }} บาท</span>
            </p>
          </div>
          <div class="px-3 py-1 rounded-full text-sm font-medium self-start"
               :class="payer.paid ? 'bg-accent/20 text-accent' : 'bg-error/20 text-error'">
            {{ payer.paid ? "จ่ายครบแล้ว" : "ยังจ่ายไม่ครบ" }}
          </div>
        </div>
        
        <div class="mt-4 pt-4 border-t border-neutral-200">
          <ul class="divide-y divide-neutral-200">
            <li
              v-for="(amount, date) in payer.dates"
              :key="date"
              class="py-3 first:pt-0 last:pb-0"
            >
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-neutral-400 mr-1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  <span class="text-neutral-700">{{ date }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <p class="text-lg text-neutral-700 font-medium">
                    {{ amount ? amount.toFixed(2) : "0.00" }} บาท
                  </p>
                  <button
                    @click="togglePaymentStatus(payer, date)"
                    class="flex items-center justify-center px-3 py-1 rounded-full transition-colors"
                    :class="peopleStore.getPaidStatusByDate(payer.name, date) 
                      ? 'bg-accent/20 text-accent hover:bg-accent/30' 
                      : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-1">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {{
                      peopleStore.getPaidStatusByDate(payer.name, date)
                        ? "จ่ายแล้ว"
                        : "ยังไม่จ่าย"
                    }}
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      
      <div v-if="filteredPayerAmounts.length === 0" class="a-card py-12">
        <div class="text-center text-neutral-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto mb-2 opacity-50">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9.75m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75m-8.25-3v1.5m0 0v1.5m0-1.5h1.5m-1.5 0h-1.5M6.75 3v3H5.25m11.25 9v3H15" />
          </svg>
          <p class="text-lg">ยังไม่มีข้อมูลสรุปยอด</p>
          <p class="text-sm">เพิ่มคนจ่ายและบิลก่อน</p>
        </div>
      </div>
    </div>

    <!-- Add QR Code Modal -->
    <div
      v-if="showAddQrCodePopup"
      class="fixed inset-0 flex items-center justify-center bg-neutral-700/75 backdrop-blur-sm z-50 transition-all"
    >
      <div class="bg-white rounded-2xl shadow-a-hover w-full max-w-md p-6 m-4">
        <h2 class="text-xl font-medium text-neutral-700 mb-5">เพิ่ม PromptPay QR Code</h2>
        <div class="mb-5">
          <label for="promptpay-input" class="block text-sm font-medium text-neutral-500 mb-1">PromptPay ID</label>
          <input
            id="promptpay-input"
            v-model="inputPromptpay"
            type="text"
            placeholder="เบอร์โทร หรือ เลขบัตรประชาชน"
            class="a-input"
          />
        </div>
        <div class="flex flex-col sm:flex-row justify-end gap-3">
          <button @click="generateQRCode" class="a-button-primary w-full sm:w-auto">
            สร้าง QR Code
          </button>
          <button @click="showAddQrCodePopup = false" class="a-button-secondary w-full sm:w-auto">
            ยกเลิก
          </button>
          
        </div>
      </div>
    </div>
  </div>
</template>
