<script setup>
const props = defineProps({
  error: {
    type: String,
    required: true
  }
});
</script>

<template>
  <div class="a-card py-12">
    <div class="text-center text-error">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
        class="w-12 h-12 mx-auto mb-2 opacity-50">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      <p class="text-lg">{{ error }}</p>
      <p class="text-sm mt-2">โปรดตรวจสอบลิงก์ที่แชร์มาอีกครั้ง</p>
    </div>
  </div>
</template>
