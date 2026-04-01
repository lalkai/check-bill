<script setup>
import { useI18n } from "vue-i18n";
import { HugeiconsIcon } from "@hugeicons/vue";
import { UserIcon } from "@hugeicons/core-free-icons";
const { t: $t } = useI18n();
</script>

<template>
  <div
    class="bg-white rounded-[2.5rem] p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100/50 flex flex-col items-center"
  >
    <div
      class="w-20 h-20 mx-auto rounded-[1.5rem] bg-neutral-50 flex items-center justify-center border border-neutral-100 mb-6"
    >
      <HugeiconsIcon :icon="UserIcon" size="40" class="text-neutral-300" />
    </div>
    <h3 class="text-neutral-700 font-black text-lg mb-2">
      {{ $t("people.noMembers") }}
    </h3>
    <p class="text-neutral-400 text-sm font-medium mb-2 max-w-xs">
      {{ $t("people.addFirstMember") }}
    </p>
  </div>
</template>
