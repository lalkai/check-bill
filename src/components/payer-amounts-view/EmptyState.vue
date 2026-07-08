<script setup>
import { useI18n } from "vue-i18n";
import { defineAsyncComponent } from "vue";
import walletData from "../../assets/animations/wallet.json";

const Vue3Lottie = defineAsyncComponent(() =>
  import("vue3-lottie").then((m) => m.Vue3Lottie),
);

const { t: $t } = useI18n();
</script>

<template>
  <div
    class="bg-white rounded-[2.5rem] p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100/50 flex flex-col items-center"
  >
    <div class="mt-2 mb-4 flex justify-center items-center">
      <Vue3Lottie
        :animation-data="walletData"
        :height="80"
        :width="80"
        class="lottie-mono"
      />
    </div>
    <h3 class="text-neutral-700 font-black text-lg mb-2">
      {{ $t("summary.noSummary") }}
    </h3>
    <p class="text-neutral-400 text-sm font-medium mb-2 max-w-xs">
      {{ $t("summary.addFirst") }}
    </p>
  </div>
</template>
