<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  payer: {
    type: Object,
    required: true
  },
  overallPromptpayID: {
    type: String,
    default: ''
  }
});

import { formatCurrency } from "../../utils/common";

const emit = defineEmits(['openPaymentModal']);

const expandedBillItems = ref(false);
const MAX_VISIBLE_ITEMS = 2;

const toggleBillItems = () => {
  expandedBillItems.value = !expandedBillItems.value;
};

const shouldShowAllItems = computed(() => {
  return expandedBillItems.value;
});

const getVisibleBillItems = computed(() => {
  if (!props.payer || !props.payer.billItems) return [];
  if (shouldShowAllItems.value || props.payer.billItems.length <= MAX_VISIBLE_ITEMS) {
    return props.payer.billItems;
  }
  return props.payer.billItems.slice(0, MAX_VISIBLE_ITEMS);
});

const getHiddenItemsCount = computed(() => {
  if (!props.payer || !props.payer.billItems) return 0;
  return Math.max(0, props.payer.billItems.length - MAX_VISIBLE_ITEMS);
});

const handlePaymentClick = () => {
  if (props.payer.paid) {
    alert("ผู้จ่ายรายนี้ได้ชำระเงินครบถ้วนแล้ว");
    return;
  }
  emit('openPaymentModal', props.payer);
};
</script>

<template>
  <div class="a-card">
    <div class="flex flex-col sm:flex-row justify-between sm:items-start gap-2 sm:gap-0">
      <div>
        <h2 class="text-xl font-semibold text-neutral-800 break-words">{{ payer.name }}</h2>
        <p class="text-lg font-medium mt-1">
          ยอดรวม: <span class="text-primary">{{ formatCurrency(payer.totalAmountDue) }} บาท</span>
        </p>
      </div>
      <div class="px-3 py-1 rounded-full text-sm font-medium self-start"
        :class="payer.paid ? 'bg-accent/20 text-accent' : 'bg-error/20 text-error'">
        {{ payer.paid ? "จ่ายครบแล้ว" : `ยอดค้างชำระ: ${formatCurrency(payer.unpaidAmountDue)} บาท` }}
      </div>
    </div>

    <!-- Date amounts section -->
    <div v-if="payer.dates && Object.keys(payer.dates).length > 0" class="mt-4 pt-4 border-t border-neutral-200">
      <h3 class="text-sm font-medium text-neutral-500 mb-2">ยอดตามวันที่:</h3>
      <ul class="divide-y divide-neutral-200">
        <li v-for="(amount, date) in payer.dates" :key="date" class="py-2 first:pt-0 last:pb-0">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="w-4 h-4 text-neutral-400 mr-1.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              <span class="text-neutral-700">{{ date }}</span>
            </div>
            <div class="flex items-center gap-2">
              <p class="text-md text-neutral-700 font-medium">
                {{ typeof amount.amount === 'number' ? formatCurrency(amount.amount) : "0.00" }} บาท
              </p>
              <div class="px-2 py-0.5 rounded-full text-xs font-medium"
                :class="amount.paid ? 'bg-accent/20 text-accent' : 'bg-neutral-100 text-neutral-500'">
                {{ amount.paid ? "จ่ายแล้ว" : "ยังไม่จ่าย" }}
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Bill items section -->
    <div v-if="payer.billItems && payer.billItems.length > 0" class="mt-4 pt-4 border-t border-neutral-200">
      <h3 class="text-sm font-medium text-neutral-500 mb-2">รายการบิล:</h3>
      <ul class="space-y-1.5">
        <li v-for="(item, index) in getVisibleBillItems" :key="index"
          class="p-2.5 bg-neutral-50/70 rounded-md border border-neutral-200/80">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm text-neutral-700">{{ item.description }}</p>
              <p class="text-xs text-neutral-500">วันที่: {{ item.date }}</p>
            </div>
            <p class="text-sm font-medium text-neutral-700">{{ formatCurrency(item.amount) }} บาท</p>
          </div>
        </li>
      </ul>
      <div v-if="getHiddenItemsCount > 0" class="mt-3 text-center">
        <button @click="toggleBillItems"
          class="text-primary hover:text-primary-dark transition-colors text-sm font-medium px-4 py-1.5 rounded-md border border-primary/30 hover:bg-primary/5">
          <div class="flex items-center justify-center">
            <svg v-if="!shouldShowAllItems" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-1">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M19.5 5.25l-7.5 7.5-7.5-7.5m15 6l-7.5 7.5-7.5-7.5" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor" class="w-4 h-4 mr-1">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M4.5 12.75l7.5-7.5 7.5 7.5m-15 6l7.5-7.5 7.5 7.5" />
            </svg>
            {{ shouldShowAllItems ? 'ซ่อนรายการ' : `แสดงเพิ่มเติม (${getHiddenItemsCount} รายการ)` }}
          </div>
        </button>
      </div>
    </div>

    <!-- Payment Button -->
    <div v-if="overallPromptpayID" class="mt-5 flex justify-center">
      <button @click="handlePaymentClick" class="a-button-primary"
        :class="{ 'opacity-80 cursor-default': payer.paid, 'hover:bg-primary-dark': !payer.paid }">
        <div class="flex items-center justify-center">
          <template v-if="payer.paid">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor" class="w-5 h-5 mr-1.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            จ่ายครบแล้ว
          </template>
          <template v-else>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor" class="w-5 h-5 mr-1.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
            </svg>
            ชำระเงิน
          </template>
        </div>
      </button>
    </div>
  </div>
</template>
