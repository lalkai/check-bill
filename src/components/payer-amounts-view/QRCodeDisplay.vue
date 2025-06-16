<script setup>
defineProps({
  showQrCode: {
    type: Boolean,
    default: false
  },
  promptpayId: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div v-if="showQrCode" class="a-card mb-6">
    <div class="flex flex-col items-center">
      <h3 class="text-lg font-medium text-neutral-700 mb-4">PromptPay QR Code</h3>
      <div class="mb-4 bg-white p-4 rounded-2xl shadow-a" id="qrcode-img-container">
        <canvas id="qrcode-img" class="rounded-2xl"></canvas>
      </div>
      <div class="flex items-center text-neutral-600">
        <span class="text-sm mr-1">PromptPay ID:</span>
        <span id="PromptpayID" class="font-medium">{{ promptpayId }}</span>
      </div>
    </div>
  </div>
</template>
