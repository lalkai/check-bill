<script setup>
defineProps({
  tag: { type: String, default: "h2" },
});
</script>

<template>
  <component
    :is="tag"
    class="text-[11px] font-black text-neutral-400 uppercase tracking-widest"
  >
    <slot />
  </component>
</template>
