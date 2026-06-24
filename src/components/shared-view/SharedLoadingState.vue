<script setup>
import { useI18n } from "vue-i18n";
const { t: $t } = useI18n();
</script>

<template>
  <div
    class="bg-white dark:bg-neutral-800 rounded-[2.5rem] p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100/50 dark:border-neutral-700/50 flex flex-col items-center"
  >
    <div
      class="w-20 h-20 mx-auto mb-6 flex items-center justify-center relative"
    >
      <div
        class="absolute inset-0 border-4 border-primary/10 rounded-full"
      ></div>
      <div
        class="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"
      ></div>
    </div>
    <h3 class="text-neutral-700 dark:text-neutral-200 font-black text-lg mb-2">
      {{ $t("shared.loading") }}
    </h3>
    <p class="text-neutral-400 dark:text-neutral-400 text-sm font-medium">
      {{ $t("shared.pleaseWait") }}
    </p>
  </div>
</template>
