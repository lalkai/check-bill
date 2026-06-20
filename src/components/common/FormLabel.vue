<script setup>
defineProps({
  for: { type: String, default: "" },
});
</script>

<template>
  <label
    :for="for"
    class="block text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-3"
  >
    <slot />
  </label>
</template>
