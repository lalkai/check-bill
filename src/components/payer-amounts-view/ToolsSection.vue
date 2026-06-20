<script setup>
import { HugeiconsIcon } from "@hugeicons/vue";
import {
  QrCode01Icon,
  Share01Icon,
} from "@hugeicons/core-free-icons";
import SectionLabel from "../common/SectionLabel.vue";

defineEmits(["show-qr-popup", "share-payer"]);
</script>

<template>
  <div class="bg-white rounded-[2rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100/50 mb-8">
    <SectionLabel class="mb-4">{{ $t("tools.title") }}</SectionLabel>
    <div class="grid grid-cols-2 gap-3">
      <!-- PromptPay QR -->
      <button
        @click="$emit('show-qr-popup')"
        class="flex flex-col items-center justify-center gap-2.5 py-5 px-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-neutral-600 hover:bg-neutral-100 transition-all active:scale-95"
      >
        <div class="w-11 h-11 rounded-xl bg-neutral-100 flex items-center justify-center">
          <HugeiconsIcon :icon="QrCode01Icon" size="20" :stroke-width="2.5" />
        </div>
        <p class="text-[10px] font-black uppercase tracking-widest leading-tight">{{ $t("tools.pay") }}</p>
      </button>

      <!-- Share -->
      <button
        @click="$emit('share-payer')"
        class="flex flex-col items-center justify-center gap-2.5 py-5 px-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-white transition-all active:scale-95 shadow-lg hover:bg-black"
      >
        <div class="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
          <HugeiconsIcon :icon="Share01Icon" size="20" :stroke-width="2.5" />
        </div>
        <p class="text-[10px] font-black uppercase tracking-widest leading-tight">{{ $t("tools.shareBill") }}</p>
      </button>
    </div>
  </div>
</template>
