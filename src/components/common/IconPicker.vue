<script setup>
import { HugeiconsIcon } from "@hugeicons/vue";
import { ICON_LIST } from "../../utils/icons";

const props = defineProps({
  modelValue: { type: String, required: true },
  layout: { type: String, default: "grid" },
});

const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <!-- Grid layout (for group forms) - icons only -->
  <div
    v-if="layout === 'grid'"
    class="grid grid-cols-5 sm:grid-cols-6 gap-2"
  >
    <button
      v-for="item in ICON_LIST"
      :key="item.value"
      type="button"
      @click="emit('update:modelValue', item.value)"
      class="flex items-center justify-center p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer"
      :class="modelValue === item.value
        ? 'border-neutral-800 bg-neutral-800 text-white shadow-md scale-105'
        : 'border-neutral-100 bg-neutral-50/50 text-neutral-500 hover:border-neutral-200 hover:bg-neutral-50'"
    >
      <HugeiconsIcon :icon="item.icon" size="22" :stroke-width="2.5" />
    </button>
  </div>

  <!-- Chips layout (for bill forms) - scrollable on mobile -->
  <div
    v-else
    class="flex sm:flex-wrap gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide"
  >
    <button
      v-for="item in ICON_LIST"
      :key="item.value"
      type="button"
      @click="emit('update:modelValue', item.value)"
      class="flex items-center justify-center p-2.5 sm:p-3 rounded-xl border-2 transition-all duration-200 flex-shrink-0 cursor-pointer"
      :class="modelValue === item.value
        ? 'border-neutral-800 bg-neutral-800 text-white'
        : 'border-neutral-200 bg-white text-neutral-400 hover:border-neutral-300 hover:text-neutral-600'"
    >
      <HugeiconsIcon :icon="item.icon" size="18" :stroke-width="2.5" />
    </button>
  </div>
</template>
