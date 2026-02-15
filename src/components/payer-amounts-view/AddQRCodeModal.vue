<script setup>
import { ref } from 'vue';

defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['generate-qr', 'close'])

const inputPromptpay = ref('');

const handleGenerateQR = () => {
  emit('generate-qr', inputPromptpay.value);
  inputPromptpay.value = '';
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 flex items-center justify-center z-50 transition-all">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')"></div>
    <div class="bg-white rounded-2xl shadow-a-hover w-full max-w-md p-6 m-4 relative z-10">
      <h2 class="text-xl font-medium text-neutral-700 mb-5">เพิ่ม PromptPay QR Code</h2>
      <div class="mb-5">
        <label for="promptpay-input" class="block text-sm font-medium text-neutral-500 mb-1">PromptPay ID</label>
        <input id="promptpay-input" v-model="inputPromptpay" type="text" placeholder="เบอร์โทร หรือ เลขบัตรประชาชน"
          class="a-input" />
      </div>
      <div class="flex flex-col sm:flex-row justify-end gap-3">
        <button @click="handleGenerateQR" class="a-button-primary w-full sm:w-auto">
          สร้าง QR Code
        </button>
        <button @click="$emit('close')" class="a-button-secondary w-full sm:w-auto">
          ยกเลิก
        </button>
      </div>
    </div>
  </div>
</template>
