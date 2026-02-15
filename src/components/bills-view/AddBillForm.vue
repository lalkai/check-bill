<script setup>
import { ref } from "vue";
import { preventNonNumberInput } from "../../utils/common";
import Calculator from "../common/Calculator.vue";

const emit = defineEmits(['addBill', 'openOcr']);

const newBillDescription = ref("");
const newBillAmount = ref("");
const newBillDate = ref(new Date().toISOString().split('T')[0]);

const showCalculator = ref(false);

function applyResult(value) {
  newBillAmount.value = value;
}

function addBill() {
  if (newBillDescription.value.trim()) {
    emit('addBill', {
      description: newBillDescription.value.trim(),
      amount: Number(newBillAmount.value),
      date: newBillDate.value
    });
    newBillDescription.value = "";
    newBillAmount.value = "";
    newBillDate.value = new Date().toISOString().split('T')[0];
  }
}

function openOcrModal() {
  emit('openOcr');
}


</script>

<template>
  <div class="a-card mb-6">
    <h2 class="a-header mb-4">เพิ่มบิลใหม่</h2>

    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="bill-description" class="block text-sm font-medium text-neutral-500 mb-1">รายการ</label>
          <input id="bill-description" v-model="newBillDescription" type="text" placeholder="รายการบิล"
            class="a-input" />
        </div>
        <div class="relative">
          <label for="bill-amount" class="block text-sm font-medium text-neutral-500 mb-1">จำนวนเงิน</label>
          <input id="bill-amount" v-model="newBillAmount" type="number" min="0" placeholder="จำนวนเงิน"
            class="a-input pr-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            @keypress="preventNonNumberInput" />
          <button @click="showCalculator = true"
            class="absolute right-2 top-8 p-1 text-neutral-500 hover:text-neutral-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm0 2.25h.008v.008H8.25v-.008ZM10.5 7.125h-3v1.5m3-1.5v1.5m-3-1.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H13.5m-3.75 0V7.125m0 0h-3" />
            </svg>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="bill-date" class="block text-sm font-medium text-neutral-500 mb-1">วันที่</label>
          <input id="bill-date" v-model="newBillDate" type="date" class="a-input cursor-pointer" />
        </div>
        <div class="flex items-end gap-2">
          <button @click="addBill" class="a-button-primary flex-[3]">
            <div class="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="w-5 h-5 mr-1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              เพิ่มบิล
            </div>
          </button>
          <button @click="openOcrModal" class="a-button-secondary flex-[1]" title="สแกนใบเสร็จ">
            <div class="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="w-5 h-5 mr-1.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
              สแกน
            </div>
          </button>
        </div>
      </div>
    </div>

    <Calculator v-model="showCalculator" @apply="applyResult" />
  </div>
</template>
