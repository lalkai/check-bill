<script setup>
import { useBillStore } from "../../stores/Bills";
import BillCard from "./BillCard.vue";

const billStore = useBillStore();

const emit = defineEmits(['editBill']);

function removeBill(bill) {
  billStore.removeBill(bill.id);
}

function openEditModal(bill) {
  emit('editBill', bill);
}
</script>

<template>
  <div class="space-y-4">
    <div v-if="billStore.bills.length === 0" class="a-card py-12">
      <div class="text-center text-neutral-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto mb-2 opacity-50">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
        <p class="text-lg">ยังไม่มีรายการบิล</p>
        <p class="text-sm">เพิ่มรายการบิลแรกของคุณด้านบน</p>
      </div>
    </div>
      <BillCard
      v-for="bill in billStore.bills"
      :key="bill.id"
      :bill="bill"
      @remove="removeBill"
      @edit="openEditModal"
    />
  </div>
</template>
