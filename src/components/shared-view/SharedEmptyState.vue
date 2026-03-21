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
          d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <h3 class="text-neutral-700 font-black text-lg mb-2">
      {{ $t("shared.emptyTitle") }}
    </h3>
    <p class="text-neutral-400 text-sm font-medium mb-2">
      {{ $t("shared.emptyDescription") }}
    </p>
  </div>
</template>
