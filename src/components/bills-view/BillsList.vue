<script setup>
import { useBillStore } from "../../stores/Bills";
import { usePeopleStore } from "../../stores/People";
import { useI18n } from "vue-i18n";

const { t: $t } = useI18n();
import BillCard from "./BillCard.vue";

const billStore = useBillStore();
const peopleStore = usePeopleStore();

const emit = defineEmits(["editBill"]);

function removeBill(bill) {
  billStore.removeBill(bill.id, peopleStore);
}

function openEditModal(bill) {
  emit("editBill", bill);
}
</script>

<template>
  <div class="space-y-4">
    <div
      v-if="billStore.bills.length === 0"
      class="bg-white rounded-[2.5rem] p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100/50 flex flex-col items-center"
    >
      <div
        class="w-20 h-20 mx-auto rounded-[1.5rem] bg-neutral-50 flex items-center justify-center border border-neutral-100 mb-6"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2.5"
          stroke="currentColor"
          class="w-10 h-10 text-neutral-300"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
          />
        </svg>
      </div>
      <h3 class="text-neutral-700 font-black text-lg mb-2">
        {{ $t("bills.noExpensesYet") }}
      </h3>
      <p class="text-neutral-400 text-sm font-medium mb-2 max-w-xs">
        {{ $t("bills.addFirstExpense") }}
      </p>
    </div>

    <div v-else class="space-y-4">
      <div class="flex items-center justify-between mb-4 px-2">
        <h2
          class="text-[11px] font-black text-neutral-400 uppercase tracking-[0.15em]"
        >
          {{ $t("bills.allExpenses") }}
        </h2>
      </div>
      <BillCard
        v-for="bill in [...billStore.bills].reverse()"
        :key="bill.id"
        :bill="bill"
        @remove="removeBill"
        @edit="openEditModal"
      />
    </div>
  </div>
</template>
