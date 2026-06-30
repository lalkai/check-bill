<script setup>
import { HugeiconsIcon } from "@hugeicons/vue";
import { Tick01Icon } from "@hugeicons/core-free-icons";
import { COLOR_PALETTE } from "../../stores/BillGroups";

defineProps({
  modelValue: { type: String, required: true },
});

const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <div class="flex flex-wrap gap-3">
    <button
      v-for="color in COLOR_PALETTE"
      :key="color"
      @click="emit('update:modelValue', color)"
      class="w-10 h-10 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center shadow-sm cursor-pointer"
      :style="{
        backgroundColor: color,
        '--tw-ring-color':
          modelValue === color ? `${color}40` : 'transparent',
      }"
      :class="
        modelValue === color ? 'ring-4 ring-offset-2 scale-110' : ''
      "
    >
      <HugeiconsIcon
        v-if="modelValue === color"
        :icon="Tick01Icon"
        size="20"
        :stroke-width="3"
        class="text-white drop-shadow-sm"
      />
    </button>
  </div>
</template>
