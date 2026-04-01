<script setup>
import { HugeiconsIcon } from "@hugeicons/vue";
import {
  QrCode01Icon,
  Delete02Icon,
  Share01Icon,
} from "@hugeicons/core-free-icons";

defineEmits(["show-qr-popup", "delete-qr", "share-payer"]);
</script>

<template>
  <div
    class="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100/50 mb-8"
  >
    <h2
      class="text-[10px] sm:text-[11px] font-black text-neutral-400 uppercase tracking-[0.15em] mb-4"
    >
      {{ $t("tools.title") }}
    </h2>
    <div class="grid grid-cols-2 sm:flex sm:flex-row gap-3 sm:gap-4">
      <button
        @click="$emit('show-qr-popup')"
        class="flex sm:flex-1 bg-neutral-50 text-neutral-600 font-black text-[10px] sm:text-[11px] uppercase tracking-widest py-3.5 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl hover:bg-neutral-100 border border-neutral-200 transition-all active:scale-95 items-center justify-center gap-2 min-w-0"
      >
        <HugeiconsIcon :icon="QrCode01Icon" size="16" stroke-width="2.5" />
        <span class="truncate">{{ $t("tools.pay") }}</span>
      </button>

      <button
        @click="$emit('delete-qr')"
        class="flex sm:flex-1 bg-red-50 text-red-500 font-black text-[10px] sm:text-[11px] uppercase tracking-widest py-3.5 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl hover:bg-red-100 border border-red-200 transition-all active:scale-95 items-center justify-center gap-2 min-w-0"
      >
        <HugeiconsIcon :icon="Delete02Icon" size="16" stroke-width="2.5" />
        <span class="truncate">{{ $t("tools.delQr") }}</span>
      </button>

      <button
        @click="$emit('share-payer')"
        class="col-span-2 sm:flex-1 bg-neutral-900 text-white font-black text-[10px] sm:text-[11px] uppercase tracking-widest py-4 px-6 rounded-xl sm:rounded-2xl hover:bg-black transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 min-w-0"
      >
        <HugeiconsIcon :icon="Share01Icon" size="16" stroke-width="2.5" />
        <span class="truncate">{{ $t("tools.shareBill") }}</span>
      </button>
    </div>
  </div>
</template>
