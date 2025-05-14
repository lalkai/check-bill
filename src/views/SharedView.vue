<script setup>
import { ref, onMounted, computed, nextTick } from "vue";
import generatePayload from "promptpay-qr";
import qrcode from "qrcode";
import LZString from "lz-string";

const allSharedData = ref(null);
const error = ref(null);
const loading = ref(true);
const showQrCodeModalForPayer = ref(null);
const qrCodeAmount = ref(0);
const overallPromptpayID = ref("");

onMounted(() => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedDataParam = urlParams.get('payer_info');
    
    if (!sharedDataParam) {
      error.value = "ไม่พบข้อมูลที่แชร์";
      loading.value = false;
      return;
    }
    
    try {
      const decompressedData = LZString.decompressFromEncodedURIComponent(sharedDataParam);
      const parsedData = JSON.parse(decompressedData);
      
      if (!parsedData || !parsedData.payers) {
        throw new Error("Invalid data format");
      }
      
      allSharedData.value = parsedData;
      
      if (parsedData.promptpayID) {
        overallPromptpayID.value = parsedData.promptpayID;
      }
      
      loading.value = false;
    } catch (lzError) {
      console.warn("Failed to decompress with LZString, trying legacy format:", lzError);
      
      try {
        const decodedInfo = decodeURIComponent(atob(sharedDataParam));
        const parsedData = JSON.parse(decodedInfo);
        
        if (!parsedData || !parsedData.payers) {
          error.value = "ข้อมูลไม่ถูกต้อง หรือไม่มีข้อมูลผู้จ่าย";
          loading.value = false;
          return;
        }
        
        allSharedData.value = parsedData;
        
        if (parsedData.promptpayID) {
          overallPromptpayID.value = parsedData.promptpayID;
        }
        
        loading.value = false;
      } catch (legacyError) {
        throw legacyError; 
      }
    }
  } catch (e) {
    console.error("Error parsing shared data:", e);
    error.value = "เกิดข้อผิดพลาดในการแสดงข้อมูล";
    loading.value = false;
  }
});

const generatePaymentQRCode = async (payerForQR) => {
  if (!overallPromptpayID.value || !payerForQR || payerForQR.totalAmountDue <= 0) {
    alert("ไม่สามารถสร้าง QR Code ได้: ไม่มี PromptPay ID หรือยอดชำระไม่ถูกต้อง");
    return;
  }

  try {
    const amount = payerForQR.totalAmountDue;
    const payload = generatePayload(overallPromptpayID.value, { amount });
    const opts = {
      type: "image/png",
      margin: 1,
      width: 220,
      color: {
        dark: "#000000",
        light: "#ffffff"
      }
    };

    const qrContainer = document.getElementById(`payment-qrcode-container-${payerForQR.name.replace(/\s+/g, '-')}`);
    if (!qrContainer) {
        console.error("QR Code container not found for payer:", payerForQR.name);
        return;
    }
    
    qrContainer.innerHTML = "";
    
    const canvas = document.createElement("canvas");
    canvas.className = "rounded-xl mx-auto";
    
    qrcode.toCanvas(canvas, payload, opts, (err) => {
      if (err) {
        console.error("Error generating payment QR Code:", err);
        qrContainer.innerHTML = '<p class="text-error text-center">ไม่สามารถสร้าง QR Code ได้</p>';
        return;
      }
      qrContainer.appendChild(canvas);
      
      const amountText = document.createElement("p");
      amountText.className = "text-center mt-3 text-neutral-700 font-semibold text-lg";
      amountText.textContent = `${amount.toFixed(2)} บาท`;
      qrContainer.appendChild(amountText);

      const promptpayInfoText = document.createElement("p");
      promptpayInfoText.className = "text-center mt-1 text-neutral-500 text-sm";
      promptpayInfoText.textContent = `PromptPay ID: ${overallPromptpayID.value}`;
      qrContainer.appendChild(promptpayInfoText);
    });
  } catch (error) {
    console.error("Error in generatePaymentQRCode:", error);
    alert("เกิดข้อผิดพลาดในการสร้าง QR Code สำหรับการชำระเงิน");
  }
};

const openPaymentModal = (payer) => {
  showQrCodeModalForPayer.value = payer;
  qrCodeAmount.value = payer.totalAmountDue;
  nextTick(() => {
    generatePaymentQRCode(payer);
  });
};

const closePaymentModal = () => {
  showQrCodeModalForPayer.value = null;
};

</script>

<template>
  <div>
    <div class="a-card mb-6">
      <h1 class="text-xl font-bold text-neutral-700">ข้อมูลการชำระเงิน</h1>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="a-card py-12">
      <div class="text-center text-neutral-500">
        <svg class="animate-spin h-10 w-10 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="a-card py-12">
      <div class="text-center text-error">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto mb-2 opacity-50">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <p class="text-lg">{{ error }}</p>
        <p class="text-sm mt-2">โปรดตรวจสอบลิงก์ที่แชร์มาอีกครั้ง</p>
      </div>
    </div>

    <!-- All Payers Data Display -->
    <div v-else-if="allSharedData && allSharedData.payers && allSharedData.payers.length > 0" class="space-y-6">
      <div v-for="payer in allSharedData.payers" :key="payer.name" class="a-card">
        <div class="flex flex-col sm:flex-row justify-between sm:items-start gap-2 sm:gap-0">
          <div>
            <h2 class="text-xl font-semibold text-neutral-800 break-words">{{ payer.name }}</h2>
            <p class="text-lg font-medium mt-1">
              ยอดรวม: <span class="text-primary">{{ payer.totalAmountDue.toFixed(2) }} บาท</span>
            </p>
          </div>
        </div>
        
        <div v-if="payer.dates && Object.keys(payer.dates).length > 0" class="mt-4 pt-4 border-t border-neutral-200">
          <h3 class="text-sm font-medium text-neutral-500 mb-2">ยอดตามวันที่:</h3>
          <ul class="divide-y divide-neutral-200">
            <li
              v-for="(amount, date) in payer.dates"
              :key="date"
              class="py-2 first:pt-0 last:pb-0"
            >
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-neutral-400 mr-1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  <span class="text-neutral-700">{{ date }}</span>
                </div>
                <div class="flex items-center">
                  <p class="text-md text-neutral-700 font-medium">
                    {{ typeof amount === 'number' ? amount.toFixed(2) : "0.00" }} บาท
                  </p>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <div v-if="payer.billItems && payer.billItems.length > 0" class="mt-4 pt-4 border-t border-neutral-200">
          <h3 class="text-sm font-medium text-neutral-500 mb-2">รายการบิล:</h3>
          <ul class="space-y-1.5">
            <li v-for="(item, index) in payer.billItems" :key="index" 
                class="p-2.5 bg-neutral-50/70 rounded-md border border-neutral-200/80">
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-sm text-neutral-700">{{ item.description }}</p>
                  <p class="text-xs text-neutral-500">วันที่: {{ item.date }}</p>
                </div>
                <p class="text-sm font-medium text-neutral-700">{{ item.amount.toFixed(2) }} บาท</p>
              </div>
            </li>
          </ul>
        </div>
        
        <!-- Payment Button for each payer -->
        <div v-if="overallPromptpayID && payer.totalAmountDue > 0" class="mt-5 flex justify-center">
          <button @click="openPaymentModal(payer)" class="a-button-primary">
            <div class="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
              </svg>
              ชำระเงิน
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <div v-else class="a-card py-12">
      <div class="text-center text-neutral-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto mb-2 opacity-50">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-lg">ไม่พบข้อมูล</p>
      </div>
    </div>
  </div>

  <!-- Payment QR Code Modal -->
  <div
    v-if="showQrCodeModalForPayer"
    class="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50 transition-all"
    @click.self="closePaymentModal" 
  >
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-xs p-6 m-4 transform transition-all duration-300 scale-100 opacity-100">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-neutral-700">สแกนเพื่อชำระเงิน</h2>
        <button @click="closePaymentModal" class="text-neutral-400 hover:text-neutral-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <p class="text-center text-neutral-600 mb-1">สำหรับ: <span class="font-medium">{{ showQrCodeModalForPayer.name }}</span></p>
      <div :id="`payment-qrcode-container-${showQrCodeModalForPayer.name.replace(/\s+/g, '-')}`" class="bg-white p-2 rounded-lg shadow-inner min-h-[200px] flex flex-col justify-center items-center"></div>
    </div>
  </div>
</template>
