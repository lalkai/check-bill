<script setup>
import { ref, computed } from "vue";
import { usePeopleStore } from "../../stores/People";
import { useI18n } from "vue-i18n";

const { t: $t } = useI18n();
const peopleStore = usePeopleStore();

const props = defineProps({
  payer: {
    type: Object,
    required: true,
  },
});

import { formatCurrency } from "../../utils/common";

const emit = defineEmits([
  "toggle-payment-status",
  "open-details",
  "settle-all",
]);

const showAllDates = ref(false);

const allDatesArray = computed(() => {
  if (!props.payer || !props.payer.dates) return [];
  return Object.entries(props.payer.dates)
    .sort((a, b) => new Date(b[0]) - new Date(a[0]))
    .map(([date, amount]) => ({ date, amount }));
});

const visibleDates = computed(() => {
  if (showAllDates.value || allDatesArray.value.length <= 2) {
    return allDatesArray.value;
  }
  return allDatesArray.value.slice(0, 2);
});

const togglePaymentStatus = (payer, date) => {
  emit("toggle-payment-status", payer, date);
};

const settleAll = () => {
  emit("settle-all", props.payer);
};

const openDetails = () => {
  emit("open-details");
};
</script>

<template>
  <div
    class="bg-white rounded-[2.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100/50 cursor-pointer group transition-all hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1"
    @click="openDetails"
  >
    <div
      class="flex flex-col sm:flex-row justify-between sm:items-start gap-4 sm:gap-0"
    >
      <div class="flex items-center gap-4">
        <div
          class="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm font-black text-xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
          :class="payer.paid ? 'bg-green-500' : 'bg-orange-500'"
        >
          {{ payer.name[0]?.toUpperCase() }}
        </div>
        <div>
          <h2 class="text-xl font-black text-neutral-800 tracking-tight">
            {{ payer.name }}
          </h2>
          <div
            class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5"
          >
            {{ $t("summary.total") }}
            <span class="font-black text-neutral-700"
              >฿{{ formatCurrency(payer.totalAmountDue) }}</span
            >
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2 self-start flex-wrap sm:flex-nowrap">
        <div
          class="px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"
          :class="
            payer.paid
              ? 'bg-green-50 text-green-600 border border-green-200/50'
              : 'bg-orange-50 text-orange-600 border border-orange-200/50'
          "
        >
          <span
            class="w-1.5 h-1.5 rounded-full"
            :class="payer.paid ? 'bg-green-500' : 'bg-orange-500'"
          ></span>
          {{
            payer.paid
              ? $t("summary.settled")
              : $t("summary.owes", {
                  amount: `฿${formatCurrency(payer.unpaidAmountDue)}`,
                })
          }}
        </div>
        <button
          v-if="!payer.paid"
          @click.stop="settleAll"
          class="bg-neutral-800 text-white font-black text-[10px] uppercase tracking-widest py-2 px-4 rounded-2xl hover:bg-neutral-900 transition-all active:scale-95 shadow-sm flex items-center gap-1.5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2.5"
            stroke="currentColor"
            class="w-3 h-3"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
          {{ $t("summary.settleAllComplete") }}
        </button>
      </div>
    </div>

    <div class="mt-6 pt-6 border-t border-dashed border-neutral-100/80">
      <ul class="divide-y divide-neutral-50/50">
        <li
          v-for="item in visibleDates"
          :key="item.date"
          class="py-3 first:pt-0 last:pb-0"
        >
          <div class="flex items-center justify-between">
            <div class="flex flex-col">
              <span
                class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest"
                >{{ item.date }}</span
              >
              <span class="text-sm font-black text-neutral-700"
                >฿{{ item.amount ? formatCurrency(item.amount) : "0.00" }}</span
              >
            </div>
            <button
              @click.stop="togglePaymentStatus(payer, item.date)"
              class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-1"
              :class="
                peopleStore.getPaidStatusByDate(payer.name, item.date)
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'bg-white border-2 border-neutral-200 text-neutral-400 hover:border-neutral-300 hover:text-neutral-600'
              "
            >
              <svg
                v-if="peopleStore.getPaidStatusByDate(payer.name, item.date)"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="3"
                stroke="currentColor"
                class="w-3.5 h-3.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
              {{
                peopleStore.getPaidStatusByDate(payer.name, item.date)
                  ? $t("summary.paid")
                  : $t("summary.markPaid")
              }}
            </button>
          </div>
        </li>
      </ul>

      <!-- Toggle Button -->
      <button
        v-if="allDatesArray.length > 2"
        @click.stop="showAllDates = !showAllDates"
        class="w-full mt-4 py-2 rounded-xl bg-neutral-50 text-[10px] font-black text-neutral-400 uppercase tracking-widest hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2 border border-neutral-100/50"
      >
        {{
          showAllDates
            ? $t("summary.hide")
            : $t("summary.showMore", { count: allDatesArray.length - 2 })
        }}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="3"
          stroke="currentColor"
          class="w-3 h-3 transition-transform duration-300"
          :class="showAllDates ? 'rotate-180' : ''"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
