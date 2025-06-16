<script setup>
import { usePeopleStore } from "../../stores/People";

const peopleStore = usePeopleStore();

defineProps({
  payer: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['toggle-payment-status'])

const togglePaymentStatus = (payer, date) => {
  emit('toggle-payment-status', payer, date);
};
</script>

<template>
  <div class="a-card transition-all duration-300">
    <div class="flex flex-col sm:flex-row justify-between sm:items-start gap-2 sm:gap-0">
      <div>
        <h2 class="text-lg font-semibold text-neutral-700 break-words">{{ payer.name }}</h2>
        <p class="text-lg font-medium mt-1">
          ยอดรวม: <span class="text-primary">{{ payer.totalAmountDue.toFixed(2) }} บาท</span>
        </p>
      </div>
      <div class="px-3 py-1 rounded-full text-sm font-medium self-start"
        :class="payer.paid ? 'bg-accent/20 text-accent' : 'bg-error/20 text-error'">
        {{ payer.paid ? "จ่ายครบแล้ว" : `ยอดค้างชำระ: ${payer.unpaidAmountDue.toFixed(2)} บาท` }}
      </div>
    </div>

    <div class="mt-4 pt-4 border-t border-neutral-200">
      <ul class="divide-y divide-neutral-200">
        <li v-for="(amount, date) in payer.dates" :key="date" class="py-3 first:pt-0 last:pb-0">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="w-4 h-4 text-neutral-400 mr-1.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              <span class="text-xs sm:text-sm md:text-base text-neutral-700">{{ date }}</span>
            </div>
            <div class="flex items-center gap-3">
              <p class="text-sm sm:text-base md:text-lg text-neutral-700 font-medium">
                {{ amount ? amount.toFixed(2) : "0.00" }} บาท
              </p>
              <button @click="togglePaymentStatus(payer, date)"
                class="flex items-center justify-center px-3 py-1 rounded-full transition-colors text-xs sm:text-sm"
                :class="peopleStore.getPaidStatusByDate(payer.name, date)
                  ? 'bg-accent/20 text-accent hover:bg-accent/30'
                  : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                  stroke="currentColor" class="w-5 h-5 mr-1">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                {{
                  peopleStore.getPaidStatusByDate(payer.name, date)
                    ? "จ่ายแล้ว"
                    : "ยังไม่จ่าย"
                }}
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
