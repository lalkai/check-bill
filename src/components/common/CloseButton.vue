<script setup>
import { HugeiconsIcon } from "@hugeicons/vue";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

defineProps({
  size: { type: String, default: "md" },
});

const emit = defineEmits(["click"]);

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-8 h-8",
  lg: "w-9 h-9",
};

const iconSizes = {
  sm: 16,
  md: 16,
  lg: 20,
};
</script>

<template>
  <button
    @click="emit('click')"
    class="rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors cursor-pointer"
    :class="sizeClasses[size]"
  >
    <HugeiconsIcon :icon="Cancel01Icon" :size="iconSizes[size]" :stroke-width="2.5" />
  </button>
</template>
