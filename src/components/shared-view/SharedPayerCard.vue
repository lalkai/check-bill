<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { formatCurrency } from "../../utils/common";
import { HugeiconsIcon } from "@hugeicons/vue";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Tick01Icon,
  QrCode01Icon,
} from "@hugeicons/core-free-icons";

const { t: $t } = useI18n();

const props = defineProps({
  payer: {
    type: Object,
    required: true,
  },
  overallPromptpayID: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["openPaymentModal"]);

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
  if (
    shouldShowAllItems.value ||
    props.payer.billItems.length <= MAX_VISIBLE_ITEMS
  ) {
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
    alert("This person has already settled their balance");
    return;
  }
  emit("openPaymentModal", props.payer);
};
</script>

<template>
  <div
    class="bg-white rounded-[2.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100/50"
  >
    <div
      class="flex flex-col sm:flex-row justify-between sm:items-start gap-4 sm:gap-0"
    >
      <div class="flex items-center gap-4 flex-1 min-w-0 pr-4">
        <div
          class="w-14 h-14 flex-shrink-0 rounded-2xl flex items-center justify-center text-white shadow-sm font-black text-xl transition-transform duration-300"
          :class="payer.paid ? 'bg-green-500' : 'bg-orange-500'"
        >
          {{ payer.name[0]?.toUpperCase() }}
        </div>
        <div class="flex-1 min-w-0">
          <h2
            class="text-xl font-black text-neutral-800 tracking-tight truncate w-full"
          >
            {{ payer.name }}
          </h2>
          <div
            class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5 truncate flex items-center gap-1"
          >
            <span class="flex-shrink-0">{{ $t("shared.total") }}</span>
            <span class="font-black text-neutral-700 truncate"
              >฿{{ formatCurrency(payer.totalAmountDue) }}</span
            >
          </div>
        </div>
      </div>
      <div
        class="px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest self-start flex items-center gap-1.5 min-w-0 truncate max-w-full"
        :class="
          payer.paid
            ? 'bg-green-50 text-green-600 border border-green-200/50'
            : 'bg-orange-50 text-orange-600 border border-orange-200/50'
        "
      >
        <span
          class="w-1.5 h-1.5 rounded-full flex-shrink-0"
          :class="payer.paid ? 'bg-green-500' : 'bg-orange-500'"
        ></span>
        <span class="truncate">
          {{
            payer.paid
              ? $t("shared.settled")
              : $t("shared.owesAmount", {
                  amount: formatCurrency(payer.unpaidAmountDue),
                })
          }}
        </span>
      </div>
    </div>

    <!-- Date amounts section -->
    <div
      v-if="payer.dates && Object.keys(payer.dates).length > 0"
      class="mt-6 pt-6 border-t border-dashed border-neutral-100/80"
    >
      <h3
        class="text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-4"
      >
        {{ $t("shared.dates") }}
      </h3>
      <ul class="space-y-3">
        <li
          v-for="(amount, date) in payer.dates"
          :key="date"
          class="bg-neutral-50/50 rounded-xl p-3 border border-neutral-100"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span
                class="text-[10px] font-bold text-neutral-500 uppercase tracking-widest"
                >{{ date }}</span
              >
            </div>
            <div class="flex items-center gap-3">
              <p class="text-sm text-neutral-700 font-black">
                ฿{{
                  typeof amount.amount === "number"
                    ? formatCurrency(amount.amount)
                    : "0.00"
                }}
              </p>
              <div
                class="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest"
                :class="
                  amount.paid
                    ? 'bg-green-100 text-green-600'
                    : 'bg-neutral-200 text-neutral-500'
                "
              >
                {{ amount.paid ? $t("shared.paid") : $t("shared.unpaid") }}
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Bill items section -->
    <div
      v-if="payer.billItems && payer.billItems.length > 0"
      class="mt-6 pt-6 border-t border-dashed border-neutral-100/80"
    >
      <h3
        class="text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-4"
      >
        {{ $t("shared.expenseBreakdown") }}
      </h3>
      <ul class="space-y-2">
        <li
          v-for="(item, index) in getVisibleBillItems"
          :key="index"
          class="p-4 bg-neutral-50/70 rounded-2xl border border-neutral-200/80"
        >
          <div class="flex justify-between items-start gap-4">
            <div class="flex-1 min-w-0">
              <p
                class="text-sm font-black text-neutral-700 tracking-tight truncate w-full"
              >
                {{ item.description }}
              </p>
              <p
                class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1"
              >
                {{ item.date }}
              </p>
            </div>
            <p class="text-sm font-black text-neutral-800 flex-shrink-0">
              ฿{{ formatCurrency(item.amount) }}
            </p>
          </div>
        </li>
      </ul>
      <div v-if="getHiddenItemsCount > 0" class="mt-4">
        <button
          @click="toggleBillItems"
          class="w-full text-primary font-black text-[10px] uppercase tracking-widest px-4 py-3 rounded-xl border-2 border-primary/20 hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
        >
          <HugeiconsIcon
            :icon="shouldShowAllItems ? ArrowUp01Icon : ArrowDown01Icon"
            size="14"
            :stroke-width="3"
          />
          {{
            shouldShowAllItems
              ? $t("shared.hide")
              : $t("shared.showMore", { count: getHiddenItemsCount })
          }}
        </button>
      </div>
    </div>

    <!-- Payment Button -->
    <div v-if="overallPromptpayID" class="mt-6 flex justify-center">
      <button
        @click="handlePaymentClick"
        class="w-full text-white font-black text-[12px] uppercase tracking-widest py-4 px-6 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
        :class="
          payer.paid
            ? 'bg-green-500 cursor-default shadow-none opacity-80'
            : 'bg-neutral-800 hover:bg-neutral-900 active:scale-95'
        "
      >
        <template v-if="payer.paid">
          <HugeiconsIcon :icon="Tick01Icon" size="20" :stroke-width="2.5" />
          {{ $t("shared.fullySettled") }}
        </template>
        <template v-else>
          <HugeiconsIcon :icon="QrCode01Icon" size="20" :stroke-width="2.5" />
          {{ $t("shared.payNow") }}
        </template>
      </button>
    </div>
  </div>
</template>
