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
  qrCodeUrl: {
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
      class="text-[11px] font-black text-primary uppercase tracking-widest mb-6"
    >
      {{ $t("qr.title") }}
    </div>
    <div
      class="bg-white p-4 rounded-3xl shadow-sm border border-primary/10 mb-6 flex items-center justify-center min-h-[234px] min-w-[234px]"
    >
      <img
        v-if="qrCodeUrl"
        :src="qrCodeUrl"
        class="rounded-xl w-[200px] h-[200px]"
        alt="PromptPay QR Code"
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { duration: 200 } }"
      />
      <!-- Spinner if loading -->
      <div v-else class="flex items-center justify-center">
        <div
          class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"
        ></div>
      </div>
    </div>
    <div
      class="flex items-center text-neutral-600 bg-primary/5 px-4 py-2 rounded-xl border border-primary/10"
    >
      <span
        class="text-[10px] font-black uppercase tracking-widest text-primary mr-2"
        >{{ $t("qr.id") }}</span
      >
      <span class="font-bold">{{ promptpayId }}</span>
    </div>
  </div>
</template>
