<script setup>
import { useI18n } from "vue-i18n";
const { t: $t } = useI18n();
defineProps({
  showQrCode: {
    type: Boolean,
    default: false,
  },
  promptpayId: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <div
    v-if="showQrCode"
    class="bg-white rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100/50 mb-8 flex flex-col items-center text-center"
  >
    <div
      class="text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-6"
    >
      {{ $t("qr.title") }}
    </div>
    <div
      class="bg-white p-4 rounded-3xl shadow-sm border border-neutral-100 mb-6"
      id="qrcode-img-container"
    >
      <canvas id="qrcode-img" class="rounded-xl"></canvas>
    </div>
    <div
      class="flex items-center text-neutral-600 bg-neutral-50 px-4 py-2 rounded-xl border border-neutral-200"
    >
      <span
        class="text-[10px] font-black uppercase tracking-widest text-neutral-400 mr-2"
        >{{ $t("qr.id") }}</span
      >
      <span id="PromptpayID" class="font-bold">{{ promptpayId }}</span>
    </div>
  </div>
</template>
