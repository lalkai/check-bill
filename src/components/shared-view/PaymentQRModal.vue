<script setup>
import { nextTick, onMounted, watch } from 'vue';
import generatePayload from "promptpay-qr";
import qrcode from "qrcode";

const props = defineProps({
  payer: {
    type: Object,
    default: null
  },
  promptpayID: {
    type: String,
    required: true
  },
  isVisible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const generatePaymentQRCode = async () => {
  if (!props.promptpayID || !props.payer) {
    alert("ไม่สามารถสร้าง QR Code ได้: ไม่มี PromptPay ID หรือข้อมูลผู้จ่ายไม่ถูกต้อง");
    return;
  }

  if (props.payer.paid) {
    alert("ผู้จ่ายรายนี้ได้ชำระเงินครบถ้วนแล้ว");
    emit('close');
    return;
  }

  const unpaidAmount = typeof props.payer.unpaidAmountDue === 'number' ?
    props.payer.unpaidAmountDue :
    props.payer.totalAmountDue;

  if (unpaidAmount <= 0) {
    alert("ไม่มียอดค้างชำระ");
    emit('close');
    return;
  }

  try {
    const amount = unpaidAmount;
    const payload = generatePayload(props.promptpayID, { amount });
    const opts = {
      type: "image/png",
      margin: 1,
      width: 220,
      color: {
        dark: "#000000",
        light: "#ffffff"
      }
    };

    const qrContainer = document.getElementById(`payment-qrcode-container-${props.payer.name.replace(/\s+/g, '-')}`);
    if (!qrContainer) {
      console.error("QR Code container not found for payer:", props.payer.name);
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

      const unpaidDates = [];
      if (props.payer.dates) {
        Object.entries(props.payer.dates).forEach(([date, dateData]) => {
          if (!dateData.paid) {
            unpaidDates.push(date);
          }
        });
      }

      if (unpaidDates.length > 0) {
        const unpaidDatesText = document.createElement("p");
        unpaidDatesText.className = "text-center mt-2 text-neutral-600 text-sm";
        unpaidDatesText.textContent = `สำหรับวันที่: ${unpaidDates.join(', ')}`;
        qrContainer.appendChild(unpaidDatesText);
      }

      const promptpayInfoText = document.createElement("p");
      promptpayInfoText.className = "text-center mt-1 text-neutral-500 text-sm";
      promptpayInfoText.textContent = `PromptPay ID: ${props.promptpayID}`;
      qrContainer.appendChild(promptpayInfoText);
    });
  } catch (error) {
    console.error("Error in generatePaymentQRCode:", error);
    alert("เกิดข้อผิดพลาดในการสร้าง QR Code สำหรับการชำระเงิน");
  }
};

// Generate QR code when modal opens
watch(() => props.isVisible, (newValue) => {
  if (newValue && props.payer) {
    nextTick(() => {
      generatePaymentQRCode();
    });
  }
});

const closeModal = () => {
  emit('close');
};

const handleBackdropClick = (event) => {
  if (event.target === event.currentTarget) {
    closeModal();
  }
};
</script>

<template>
  <div v-if="isVisible && payer"
    class="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50 transition-all"
    @click="handleBackdropClick">
    <div
      class="bg-white rounded-xl shadow-2xl w-full max-w-xs p-6 m-4 transform transition-all duration-300 scale-100 opacity-100">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-neutral-700">สแกนเพื่อชำระเงิน</h2>
        <button @click="closeModal" class="text-neutral-400 hover:text-neutral-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
            class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <p class="text-center text-neutral-600 mb-1">สำหรับ: <span class="font-medium">{{ payer.name }}</span></p>
      <p v-if="typeof payer.unpaidAmountDue === 'number' && payer.unpaidAmountDue < payer.totalAmountDue"
        class="text-center text-xs text-accent mb-2">
        แสดงเฉพาะยอดที่ยังไม่ได้จ่าย
      </p>
      <div :id="`payment-qrcode-container-${payer.name.replace(/\s+/g, '-')}`"
        class="bg-white p-2 rounded-lg shadow-inner min-h-[200px] flex flex-col justify-center items-center"></div>
    </div>
  </div>
</template>
