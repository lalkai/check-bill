<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  payer: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close']);

import { formatCurrency } from "../../utils/common";
</script>

<template>
  <div v-if="show && payer" class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
    <div class="fixed inset-0 bg-black/40" @click="emit('close')"></div>

    <div
      class="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 max-h-[85vh] overflow-hidden animate-modalIn">
      <div class="p-6 pb-4">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-bold text-neutral-800">{{ payer.name }}</h2>
            <p class="text-sm text-neutral-500">รายการบิลที่ต้องจ่าย</p>
          </div>
        </div>

        <div class="border-t border-neutral-200 pt-4">
          <div class="flex justify-between items-center mb-4 bg-primary/5 px-4 py-3 rounded-lg">
            <span class="text-sm font-medium text-neutral-600">ยอดรวม</span>
            <span class="text-lg font-bold text-primary">{{ formatCurrency(payer.totalAmountDue) }} บาท</span>
          </div>

          <div v-if="payer.billItems && payer.billItems.length > 0" class="space-y-2 max-h-[40vh] overflow-y-auto">
            <div v-for="(item, index) in payer.billItems" :key="index" class="p-3 bg-neutral-50 rounded-lg">
              <div class="flex justify-between items-start gap-2">
                <div class="flex-1">
                  <p class="text-sm font-medium text-neutral-800">{{ item.description }}</p>
                  <div class="flex items-center gap-1 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                      stroke="currentColor" class="w-3 h-3 text-neutral-400">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                    </svg>
                    <span class="text-xs text-neutral-500">{{ item.date }}</span>
                  </div>
                </div>
                <span class="text-sm font-semibold text-primary">{{ formatCurrency(item.amount) }} บาท</span>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-neutral-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor" class="w-12 h-12 mx-auto mb-2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <p class="text-sm">ไม่มีรายการบิล</p>
          </div>
        </div>
      </div>

      <div class="bg-neutral-50 px-6 py-3 border-t border-neutral-200">
        <button @click="emit('close')" class="a-button-secondary w-full">
          ปิด
        </button>
      </div>
    </div>
  </div>
</template>
