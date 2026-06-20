<script setup>
const props = defineProps({
  modelValue: { type: [String, Number], default: "" },
  type: { type: String, default: "text" },
  placeholder: { type: String, default: "" },
  id: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue", "keyup"]);

const handleInput = (e) => {
  emit("update:modelValue", e.target.value);
};
</script>

<template>
  <input
    :id="id"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    class="w-full px-5 py-4 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none font-bold text-neutral-700 placeholder-neutral-300 transition-colors"
    :class="type === 'number' ? '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-black' : ''"
    @input="handleInput"
    @keyup="emit('keyup', $event)"
  />
</template>
