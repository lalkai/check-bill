<script setup>
import { useBillGroupsStore } from "../../stores/BillGroups";
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import EmptyState from "../common/EmptyState.vue";
import SectionLabel from "../common/SectionLabel.vue";

const { t: $t } = useI18n();
import BillCard from "./BillCard.vue";

const groupsStore = useBillGroupsStore();

const emit = defineEmits(["editBill"]);

const sortedBills = computed(() => {
  return [...groupsStore.activeBills].reverse();
});

function removeBill(bill) {
  groupsStore.removeBill(bill.id);
}

function openEditModal(bill) {
  emit("editBill", bill);
}
</script>

<template>
  <div class="space-y-4">
    <EmptyState
      v-if="groupsStore.activeBills.length === 0"
      icon="general"
      :title="$t('bills.noExpensesYet')"
      :description="$t('bills.addFirstExpense')"
    />

    <div v-else class="space-y-4">
      <div class="flex items-center justify-between mb-4 px-2">
        <SectionLabel>{{ $t("bills.allExpenses") }}</SectionLabel>
      </div>
      <BillCard
        v-for="(bill, index) in sortedBills"
        :key="bill.id"
        :bill="bill"
        :style="{ animationDelay: `${index * 50}ms` }"
        @remove="removeBill"
        @edit="openEditModal"
      />
    </div>
  </div>
</template>
