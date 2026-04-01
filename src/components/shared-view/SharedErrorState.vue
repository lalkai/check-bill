<script setup>
import { useI18n } from "vue-i18n";
import { HugeiconsIcon } from "@hugeicons/vue";
import { AlertCircleIcon } from "@hugeicons/core-free-icons";
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
      <HugeiconsIcon :icon="AlertCircleIcon" size="40" class="text-red-400" />
    </div>
    <h3 class="text-red-600 font-black text-lg mb-2">{{ error }}</h3>
    <p class="text-neutral-400 text-sm font-medium mb-2 max-w-xs">
      {{ $t("shared.verifyLink") }}
    </p>
  </div>
</template>
