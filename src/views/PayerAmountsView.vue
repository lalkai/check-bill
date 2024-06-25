<script setup>
import { useBillStore } from '../stores/Bills'

const billStore = useBillStore()
</script>

<template>
  <div class="mt-8">
    <ul class="space-y-2">
      <li 
        v-for="(amount, name) in billStore.payerAmounts"
        :key="name"
        class="p-4 mb-2 bg-primary text-primary-content rounded-lg shadow-lg flex justify-between items-center"
      >
        <span class="font-semibold">{{ name }} </span> 
        <span>{{ amount.toFixed(2) }} บาท</span>
      </li>
    </ul>
  </div>
</template>


