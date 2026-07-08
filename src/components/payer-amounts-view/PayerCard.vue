<script setup>
import { computed } from "vue";
import { useBillGroupsStore } from "../../stores/BillGroups";
import { useI18n } from "vue-i18n";
import { hexToRgb } from "../../utils/theme";

const { t: $t } = useI18n();
const groupsStore = useBillGroupsStore();

const props = defineProps({
  payer: {
    type: Object,
    required: true,
  },
});

import { formatCurrency } from "../../utils/common";
import { HugeiconsIcon } from "@hugeicons/vue";
import { CrownIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

const emit = defineEmits(["open-details"]);

const groupColor = computed(() => groupsStore.activeGroup?.color || "#0066cc");
const groupColorRgb = computed(() => hexToRgb(groupColor.value));

const avatarStyle = computed(() => {
  if (props.payer.isOwner) {
    return { backgroundColor: "#f59e0b" };
  }
  return { backgroundColor: groupColor.value };
});

const viewDetailsBtnStyle = computed(() => ({
  backgroundColor: groupColor.value,
  boxShadow: `0 2px 8px rgba(${groupColorRgb.value.r}, ${groupColorRgb.value.g}, ${groupColorRgb.value.b}, 0.2)`,
}));

const openDetails = () => {
  emit("open-details");
};
</script>

<template>
  <div
    class="bg-white rounded-[2rem] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-neutral-100/50 cursor-pointer group transition-all hover:shadow-[0_12px_32px_rgb(0,0,0,0.08)] hover:-translate-y-0.5"
    @click="openDetails"
  >
    <div class="flex items-center gap-4">
      <!-- Avatar -->
      <div
        class="w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center text-white shadow-sm font-black text-lg transition-transform duration-300 group-hover:scale-110"
        :style="avatarStyle"
      >
        <HugeiconsIcon
          v-if="payer.isOwner"
          :icon="CrownIcon"
          size="20"
          :stroke-width="2.5"
        />
        <span v-else>{{ payer.name[0]?.toUpperCase() }}</span>
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <h2
            class="text-base font-black text-neutral-800 tracking-tight truncate"
          >
            {{ payer.name }}
          </h2>
          <span
            v-if="payer.isOwner"
            class="text-[8px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200 flex-shrink-0"
          >
            {{ $t("summary.billOwner") }}
          </span>
          <span
            v-else-if="payer.paid"
            class="text-[8px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-1.5 py-0.5 rounded-md border border-green-200 flex-shrink-0"
          >
            {{ $t("summary.settled") }}
          </span>
          <span
            v-else
            class="text-[8px] font-black text-orange-500 uppercase tracking-widest bg-orange-50 px-1.5 py-0.5 rounded-md border border-orange-200 flex-shrink-0"
          >
            {{ $t("dashboard.owes") }}
          </span>
        </div>
        <p class="text-[11px] text-neutral-400 font-bold mt-0.5">
          {{
            payer.isOwner ? $t("summary.totalSponsored") : $t("summary.total")
          }}
          <span class="text-neutral-700 font-black"
            >฿{{ formatCurrency(payer.totalAmountDue) }}</span
          >
        </p>
      </div>

      <!-- Arrow button -->
      <div class="flex-shrink-0">
        <div
          v-if="!payer.isOwner"
          class="w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95"
          :style="viewDetailsBtnStyle"
        >
          <HugeiconsIcon
            :icon="ArrowRight01Icon"
            size="16"
            :stroke-width="2.5"
            class="text-white"
          />
        </div>
        <div
          v-else
          class="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-50 border border-amber-200"
        >
          <HugeiconsIcon
            :icon="ArrowRight01Icon"
            size="16"
            :stroke-width="2.5"
            class="text-amber-500"
          />
        </div>
      </div>
    </div>
  </div>
</template>
