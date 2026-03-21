<script setup>
import { useI18n } from "vue-i18n";
const { t: $t } = useI18n();

const props = defineProps({
  error: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div
    class="bg-white rounded-[2.5rem] p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100/50 flex flex-col items-center"
  >
    <div
      class="w-20 h-20 mx-auto rounded-[1.5rem] bg-red-50 flex items-center justify-center border border-red-100 mb-6"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2.5"
        stroke="currentColor"
        class="w-10 h-10 text-red-400"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
    </div>
    <h3 class="text-red-600 font-black text-lg mb-2">{{ error }}</h3>
    <p class="text-neutral-400 text-sm font-medium mb-2 max-w-xs">
      {{ $t("shared.verifyLink") }}
    </p>
  </div>
</template>
