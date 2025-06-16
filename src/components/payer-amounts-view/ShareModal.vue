<script setup>
import { ref, watch, nextTick } from 'vue';
import qrcode from "qrcode";

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  payerAmounts: {
    type: Array,
    default: () => []
  },
  shareUrl: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'generate-share-url', 'open-share-link', 'reset-share'])

const selectedPayers = ref([]);
const selectAllPayers = ref(true);

watch(() => props.show, (newValue) => {
  if (newValue) {
    selectedPayers.value = props.payerAmounts.map(payer => payer.name);
    selectAllPayers.value = true;
  }
});

watch(() => props.shareUrl, async (newValue) => {
  if (newValue && props.show) {
    await nextTick();
    generateShareQRCode(newValue);
  }
});

const toggleSelectAllPayers = () => {
  if (selectAllPayers.value) {
    selectedPayers.value = props.payerAmounts.map(payer => payer.name);
  } else {
    selectedPayers.value = [];
  }
};

const togglePayerSelection = (payerName) => {
  const index = selectedPayers.value.indexOf(payerName);

  if (index === -1) {
    selectedPayers.value.push(payerName);
  } else {
    selectedPayers.value.splice(index, 1);
  }

  selectAllPayers.value = selectedPayers.value.length === props.payerAmounts.length;
  selectedPayers.value = [...selectedPayers.value];
};

const generateShareQRCode = (url) => {
  const shareQrCodeContainer = document.getElementById("share-qrcode");
  if (!shareQrCodeContainer) {
    console.warn("share-qrcode container not found when trying to generate QR.");
    return;
  }

  while (shareQrCodeContainer.firstChild) {
    shareQrCodeContainer.removeChild(shareQrCodeContainer.firstChild);
  }

  const canvas = document.createElement('canvas');
  shareQrCodeContainer.appendChild(canvas);

  const opts = {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    margin: 1,
    width: 180,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  };

  qrcode.toCanvas(canvas, url, opts, (err) => {
    if (err) {
      console.error("Error generating share QR Code:", err);
      if (shareQrCodeContainer.contains(canvas)) {
        shareQrCodeContainer.removeChild(shareQrCodeContainer.firstChild);
      }
    }  });
};

const handleGenerateShareUrl = () => {
  emit('generate-share-url', selectedPayers.value);
};

const handleReset = () => {
  selectedPayers.value = props.payerAmounts.map(payer => payer.name);
  selectAllPayers.value = true;
  emit('reset-share');
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50 transition-all">
    <div class="bg-white rounded-2xl shadow-a-hover w-full max-w-md p-6 m-4">
      <h2 class="text-xl font-medium text-neutral-700 mb-5">แชร์ข้อมูลการชำระเงิน</h2>

      <!-- Payer Selection -->
      <div v-if="!shareUrl" class="mb-5">
        <div class="flex items-center justify-between mb-3">
          <label class="block text-sm font-medium text-neutral-500">เลือกผู้ที่ต้องการแชร์</label>
          <div class="flex items-center">
            <input 
              type="checkbox" 
              id="select-all" 
              v-model="selectAllPayers" 
              @change="toggleSelectAllPayers"
              class="h-4 w-4 text-primary border-gray-300 rounded" 
            />
            <label for="select-all" class="ml-2 text-sm text-neutral-600">เลือกทั้งหมด</label>
          </div>
        </div>
        <div class="max-h-60 overflow-y-auto border border-neutral-200 rounded-lg p-2">
          <div v-for="payer in payerAmounts" :key="payer.name"
            class="flex items-center p-2 hover:bg-neutral-100 rounded-md">
            <input 
              type="checkbox" 
              :id="'payer-' + payer.name" 
              :checked="selectedPayers.includes(payer.name)"
              @click="togglePayerSelection(payer.name)" 
              class="h-4 w-4 text-primary border-gray-300 rounded" 
            />
            <label :for="'payer-' + payer.name" class="ml-2 flex-1 flex justify-between cursor-pointer">
              <span class="text-sm text-neutral-700">{{ payer.name }}</span>
              <div class="flex flex-col items-end">
                <span class="text-sm">
                  {{ payer.unpaidAmountDue > 0 ? payer.unpaidAmountDue.toFixed(2) + ' บาท' : 'จ่ายครบแล้ว' }}
                </span>
              </div>
            </label>
          </div>
        </div>
        <div class="mt-4 flex">
          <button @click="handleGenerateShareUrl" class="a-button-primary flex-1" :disabled="selectedPayers.length === 0">
            แชร์ข้อมูลที่เลือก
          </button>
        </div>
      </div>

      <!-- Share URL -->
      <div v-if="shareUrl" class="mb-5">
        <label class="block text-sm font-medium text-neutral-500 mb-1">
          ลิงก์สำหรับแชร์ข้อมูล ({{ selectedPayers.length }} คน)
        </label>
        <div class="flex">
          <input type="text" readonly :value="shareUrl" class="a-input flex-grow mr-2" />
        </div>
        <p class="text-yellow-600 text-sm mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="w-4 h-4 inline-block mr-1">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <span>โปรดทราบ: ข้อมูลการชำระเงินที่แชร์ไปจะไม่อัพเดทอัตโนมัติ หากต้องการอัพเดทข้อมูลเพิ่มเติม
            ต้องแชร์ลิงก์ใหม่อีกครั้ง</span>
        </p>

        <!-- Share QR Code -->
        <div class="mt-5 flex flex-col items-center">
          <h3 class="text-sm font-medium text-neutral-500 mb-3">สแกนเพื่อเปิด</h3>
          <div id="share-qrcode" class="bg-white p-3 rounded-lg shadow-a"></div>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <button v-if="shareUrl" @click="$emit('open-share-link')" class="a-button-primary w-full">
          เปิดลิงก์แชร์
        </button>

        <div v-if="shareUrl" class="flex gap-3">
          <button @click="handleReset" class="a-button-secondary flex-1 sm:text-sm">
            ย้อนกลับ
          </button>
          <button @click="$emit('close')" class="a-button-secondary flex-1 sm:text-sm">
            ปิด
          </button>
        </div>

        <button v-if="!shareUrl" @click="$emit('close')" class="a-button-secondary w-full">
          ปิด
        </button>
      </div>
    </div>
  </div>
</template>
