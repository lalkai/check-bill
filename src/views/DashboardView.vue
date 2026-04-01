<script setup>
import { computed } from "vue";
import { useBillStore } from "../stores/Bills";
import { usePeopleStore } from "../stores/People";
import { useBillGroupsStore } from "../stores/BillGroups";
import { useI18n } from "vue-i18n";
import { formatCurrency } from "../utils/common";
import { HugeiconsIcon } from "@hugeicons/vue";
import { Invoice01Icon } from "@hugeicons/core-free-icons";

const { t: $t } = useI18n();
const billStore = useBillStore();
const peopleStore = usePeopleStore();
const groupsStore = useBillGroupsStore();

const activeGroup = computed(() => groupsStore.activeGroup);
const totalSpend = computed(() => billStore.totalAmount);
const groupSize = computed(() => peopleStore.list.length);

// Recent expenses (limited to 5 for dashboard)
const recentExpenses = computed(() => {
  return [...billStore.bills].reverse().slice(0, 5);
});

// Settlement logic based on unpaid amounts
const settlements = computed(() => {
  const amounts = billStore.payerAmounts;
  const pendingSettlements = [];

  Object.entries(amounts).forEach(([name, dates]) => {
    let unpaid = 0;
    Object.entries(dates).forEach(([date, amount]) => {
      if (!peopleStore.getPaidStatusByDate(name, date)) {
        unpaid += amount;
      }
    });

    if (unpaid > 0) {
      pendingSettlements.push({
        from: name,
        to: $t("dashboard.groupsLabel"),
        amount: unpaid,
        reason: $t("dashboard.pendingBalance"),
      });
    }
  });

  return pendingSettlements;
});
</script>

<template>
  <div class="space-y-8 pb-12">
    <!-- Header Section -->
    <div
      class="bg-white rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100/50"
    >
      <div class="flex flex-col gap-1.5 min-w-0">
        <span
          class="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-70 flex-shrink-0"
          >{{ $t("dashboard.currentGroup") }}</span
        >
        <h1
          class="text-3xl font-black text-neutral-700 leading-tight tracking-tight truncate w-full"
        >
          {{ activeGroup?.name || $t("dashboard.myTrip") }}
        </h1>
      </div>

      <div class="mt-8 flex items-end justify-between gap-4">
        <div class="min-w-0 flex-1">
          <p
            class="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-1"
          >
            {{ $t("dashboard.totalSpend") }}
          </p>
          <div class="flex items-baseline gap-1 min-w-0 overflow-hidden">
            <span
              class="text-3xl sm:text-4xl font-black text-neutral-700 truncate"
              >฿{{ formatCurrency(totalSpend) }}</span
            >
          </div>
        </div>
        <div
          class="bg-neutral-50 px-4 py-2 rounded-2xl flex items-center gap-2 border border-neutral-100 flex-shrink-0"
        >
          <div class="flex -space-x-2">
            <div
              v-for="(person, i) in peopleStore.list.slice(0, 1)"
              :key="i"
              class="w-7 h-7 rounded-full bg-white border-2 border-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-400 shadow-sm"
            >
              {{ person.name[0]?.toUpperCase() }}
            </div>
            <div
              v-if="groupSize > 1"
              class="w-7 h-7 rounded-full bg-primary/10 border-2 border-white flex items-center justify-center text-[10px] font-bold text-primary shadow-sm"
            >
              +{{ groupSize - 1 }}
            </div>
            <div
              v-if="groupSize === 0"
              class="w-7 h-7 rounded-full bg-white border-2 border-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-400 shadow-sm"
            >
              -
            </div>
          </div>
          <span class="text-xs font-black text-neutral-500">{{
            $t("dashboard.peopleCount", { count: groupSize })
          }}</span>
        </div>
      </div>
    </div>

    <!-- Settlement Status Section -->
    <section v-if="settlements.length > 0">
      <div class="flex items-center justify-between mb-4 px-2">
        <h2
          class="text-[11px] font-black text-neutral-400 uppercase tracking-[0.15em]"
        >
          {{ $t("dashboard.settlementStatus") }}
        </h2>
      </div>

      <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
        <div
          v-for="(settlement, index) in settlements"
          :key="index"
          class="min-w-[220px] bg-white p-6 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-neutral-100 flex flex-col group transition-all duration-300 hover:border-orange-200"
        >
          <!-- Header: Avatar + Name -->
          <div class="flex items-center gap-3 mb-6">
            <div
              class="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 font-black text-lg border border-orange-100/50 group-hover:scale-110 transition-transform"
            >
              {{ settlement.from[0]?.toUpperCase() }}
            </div>
            <h3
              class="text-sm font-black text-neutral-800 tracking-tight truncate"
            >
              {{ settlement.from }}
            </h3>
          </div>

          <!-- Bottom Summary -->
          <div class="flex items-center justify-between mt-auto gap-2">
            <span
              class="text-[9px] font-black text-neutral-400 uppercase tracking-[0.15em] flex-shrink-0"
              >{{ $t("dashboard.owes") }}</span
            >
            <div
              class="bg-orange-50 px-4 py-2 rounded-xl text-orange-600 font-black text-sm border border-orange-100/50 truncate min-w-0 flex-1 text-right"
            >
              ฿{{ formatCurrency(settlement.amount) }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Recent Expenses List -->
    <section>
      <div class="flex items-center justify-between mb-4 px-2">
        <h2
          class="text-[11px] font-black text-neutral-400 uppercase tracking-[0.15em]"
        >
          {{ $t("dashboard.recentExpenses") }}
        </h2>
      </div>

      <div
        class="bg-white rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-neutral-100/50"
      >
        <div
          v-if="recentExpenses.length === 0"
          class="p-8 text-center text-neutral-400 font-medium text-sm"
        >
          {{ $t("dashboard.noExpensesYet") }}
        </div>
        <div v-else class="divide-y divide-neutral-50/50">
          <div
            v-for="bill in recentExpenses"
            :key="bill.id"
            class="p-5 flex items-center justify-between hover:bg-neutral-50/50 transition-colors group"
          >
            <div class="flex items-center gap-4 flex-1 min-w-0 pr-4">
              <div
                class="w-12 h-12 flex-shrink-0 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100/50 group-hover:scale-110 transition-transform"
              >
                <HugeiconsIcon :icon="Invoice01Icon" size="20" />
              </div>
              <div class="flex flex-col flex-1 min-w-0">
                <span
                  class="text-sm font-black text-neutral-700 tracking-tight truncate w-full"
                  >{{ bill.description }}</span
                >
                <span
                  class="text-[10px] text-neutral-400 font-bold uppercase tracking-wide mt-0.5"
                  >{{ bill.date }} •
                  {{
                    $t("dashboard.payersCount", { count: bill.payers.length })
                  }}</span
                >
              </div>
            </div>
            <div class="text-right flex-shrink-0 min-w-0 max-w-[35%]">
              <span class="text-sm font-black text-neutral-700 truncate block"
                >฿{{ formatCurrency(bill.amount) }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
