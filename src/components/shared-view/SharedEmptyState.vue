<script setup>
import { useI18n } from "vue-i18n";
import { HugeiconsIcon } from "@hugeicons/vue";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
const { t: $t } = useI18n();
</script>

<template>
  <div
    class="bg-white dark:bg-neutral-800 rounded-[2.5rem] p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100/50 dark:border-neutral-700/50 flex flex-col items-center"
  >
    <div
      class="w-20 h-20 mx-auto rounded-[1.5rem] bg-neutral-50 dark:bg-neutral-700 flex items-center justify-center border border-neutral-100 dark:border-neutral-600 mb-6"
    >
      <HugeiconsIcon
        :icon="Cancel01Icon"
        size="40"
        class="text-neutral-300 dark:text-neutral-400"
      />
    </div>
    <h3 class="text-neutral-700 dark:text-neutral-200 font-black text-lg mb-2">
      {{ $t("shared.emptyTitle") }}
    </h3>
    <p class="text-neutral-400 dark:text-neutral-400 text-sm font-medium mb-2">
      {{ $t("shared.emptyDescription") }}
    </p>
  </div>
</template>
