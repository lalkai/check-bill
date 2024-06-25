<template>
  <div class="mt-8">
    <ul class="space-y-2">
      <li 
        v-for="(payer, index) in payerAmounts"
        :key="index"
        class="p-4 mb-2 bg-primary text-primary-content rounded-lg shadow-lg flex justify-between items-center"
      >
        <span>{{ payer.name }} ({{ payer.paid ? "จ่ายแล้ว" : "ยังไม่จ่าย" }})</span> 
        <span>{{ payer.amount ? payer.amount.toFixed(2) : '0.00' }} บาท</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useBillStore } from '../stores/Bills';
import { usePeopleStore } from '../stores/People';

const billStore = useBillStore();
const peopleStore = usePeopleStore();

const payerAmounts = computed(() => {
  const amounts = billStore.payerAmounts;
  const peopleList = peopleStore.list;

  return Object.entries(amounts).map(([name, amount]) => {
    const person = peopleList.find(person => person.name === name);
    return {
      name,
      amount: amount || 0,
      paid: person ? person.paid : false
    };
  });
});
</script>
