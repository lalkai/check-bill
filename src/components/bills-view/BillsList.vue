<script setup>
import { useBillStore } from "../../stores/Bills";
import { usePeopleStore } from "../../stores/People";
import { useI18n } from "vue-i18n";
import { computed } from "vue";

const { t: $t } = useI18n();
import BillCard from "./BillCard.vue";
import { HugeiconsIcon } from "@hugeicons/vue";
import { Invoice01Icon } from "@hugeicons/core-free-icons";

const billStore = useBillStore();
const peopleStore = usePeopleStore();

const emit = defineEmits(["editBill"]);

const sortedBills = computed(() => {
  return [...billStore.bills].reverse();
});

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
        <HugeiconsIcon
          :icon="Invoice01Icon"
          size="40"
          class="text-neutral-300"
        />
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
        v-for="bill in sortedBills"
        :key="bill.id"
        :bill="bill"
        @remove="removeBill"
        @edit="openEditModal"
      />
    </div>
  </div>
</template>
