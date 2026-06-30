<script setup>
defineProps({
  disabled: { type: Boolean, default: false },
  variant: { type: String, default: "primary" },
});

defineEmits(["click"]);
</script>

<template>
  <button
    @click="$emit('click')"
    :disabled="disabled"
    class="font-black text-[12px] uppercase tracking-widest py-4 px-6 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    :class="[
      variant === 'primary' ? 'bg-neutral-800 text-white hover:bg-neutral-900 shadow-lg' : '',
      variant === 'danger' ? 'bg-white border-2 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300' : '',
      variant === 'secondary' ? 'bg-white border-2 border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300' : '',
    ]"
  >
    <slot />
  </button>
</template>
