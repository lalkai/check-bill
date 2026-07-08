<script setup>
import { computed } from "vue";
import { useBillGroupsStore } from "../stores/BillGroups";
import { useI18n } from "vue-i18n";
import { formatCurrency, applyRounding } from "../utils/common";
import SectionLabel from "../components/common/SectionLabel.vue";
import { HugeiconsIcon } from "@hugeicons/vue";
import { getIcon } from "../utils/icons";

const { t: $t } = useI18n();
const groupsStore = useBillGroupsStore();

const activeGroup = computed(() => groupsStore.activeGroup);
const totalSpend = computed(() => groupsStore.totalAmount);
const groupSize = computed(() => groupsStore.activePeople.length);

const recentExpenses = computed(() => {
  return [...groupsStore.activeBills].reverse().slice(0, 5);
});

const settlements = computed(() => {
  const pendingSettlements = [];
  const ownerName = groupsStore.activeGroup?.ownerName || "";
  const peopleList = groupsStore.activePeople;

  peopleList.forEach((person) => {
    if (person.name === ownerName) return;

    let unpaid = 0;
    groupsStore.activeBills.forEach((bill) => {
      const payerInfo = bill.payers.find((p) => p.name === person.name);
      if (payerInfo && !payerInfo.paid) {
        const serviceChargeRatio = 1 + (bill.serviceCharge || 0) / 100;
        const vatRatio = 1 + (bill.vat || 0) / 100;
        const rawSplit = bill.payers.length
          ? (bill.amount / bill.payers.length) * serviceChargeRatio * vatRatio
          : 0;
        const split = applyRounding(rawSplit, groupsStore.roundingMode);
        unpaid += split;
      }
    });

    if (unpaid > 0) {
      pendingSettlements.push({
        from: person.name,
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
  <div
    class="space-y-8 pb-12"
    v-motion
    :initial="{ opacity: 0, scale: 0.97, y: 15 }"
    :enter="{
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 220, damping: 24 },
    }"
  >
    <!-- Header Section -->
    <div
      class="bg-gradient-to-br from-primary to-primary-light text-white rounded-[2.5rem] p-8 shadow-lg border border-white/10 relative overflow-hidden"
    >
      <div
        class="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"
      ></div>
      <div
        class="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-black/10 blur-xl"
      ></div>

      <div class="flex flex-col gap-1.5 min-w-0 relative z-10">
        <span
          class="text-[10px] font-black text-white/70 uppercase tracking-[0.15em] flex-shrink-0"
          >{{ $t("dashboard.currentGroup") }}</span
        >
        <h1
          class="text-3xl font-black text-white leading-tight tracking-tight truncate w-full"
        >
          {{ activeGroup?.name || $t("dashboard.myTrip") }}
        </h1>
      </div>

      <div class="mt-8 flex items-end justify-between gap-4 relative z-10">
        <div class="min-w-0 flex-1">
          <p
            class="text-xs text-white/75 font-bold uppercase tracking-wider mb-1"
          >
            {{ $t("dashboard.totalSpend") }}
          </p>
          <div class="flex items-baseline gap-1 min-w-0 overflow-hidden">
            <span class="text-3xl sm:text-4xl font-black text-white truncate"
              >฿{{ formatCurrency(totalSpend) }}</span
            >
          </div>
        </div>
        <div
          class="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/10 flex-shrink-0"
        >
          <div class="flex -space-x-2">
            <div
              v-for="(person, i) in groupsStore.activePeople.slice(0, 1)"
              :key="i"
              class="w-7 h-7 rounded-full bg-white/20 border-2 border-white/15 flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
            >
              {{ person.name[0]?.toUpperCase() }}
            </div>
            <div
              v-if="groupSize > 1"
              class="w-7 h-7 rounded-full bg-white border-2 border-white flex items-center justify-center text-[10px] font-bold text-primary shadow-sm"
            >
              +{{ groupSize - 1 }}
            </div>
            <div
              v-if="groupSize === 0"
              class="w-7 h-7 rounded-full bg-white/20 border-2 border-white/15 flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
            >
              -
            </div>
          </div>
          <span class="text-xs font-black text-white/90">{{
            $t("dashboard.peopleCount", { count: groupSize })
          }}</span>
        </div>
      </div>
    </div>

    <!-- Settlement Status Section -->
    <section v-if="settlements.length > 0">
      <div class="flex items-center justify-between mb-4 px-2">
        <SectionLabel>{{ $t("dashboard.settlementStatus") }}</SectionLabel>
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
        <SectionLabel>{{ $t("dashboard.recentExpenses") }}</SectionLabel>
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
                class="w-12 h-12 flex-shrink-0 rounded-2xl bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform"
              >
                <HugeiconsIcon :icon="getIcon(bill.icon)" size="20" />
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
