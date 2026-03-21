<script setup>
import { useI18n } from "vue-i18n";
const { t: $t } = useI18n();
</script>

<template>
  <div
    class="bg-white rounded-[2.5rem] p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100/50 flex flex-col items-center"
  >
    <div
      class="w-20 h-20 mx-auto rounded-[1.5rem] bg-neutral-50 flex items-center justify-center border border-neutral-100 mb-6"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2.5"
        stroke="currentColor"
        class="w-10 h-10 text-neutral-300"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M9 12h6m-3-3v6m-6 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    </div>
    <h3 class="text-neutral-700 font-black text-lg mb-2">
      {{ $t("summary.noSummary") }}
    </h3>
    <p class="text-neutral-400 text-sm font-medium mb-2 max-w-xs">
      {{ $t("summary.addFirst") }}
    </p>
  </div>
</template>
