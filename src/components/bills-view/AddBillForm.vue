<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { preventNonNumberInput } from "../../utils/common";
import Calculator from "../common/Calculator.vue";
import { HugeiconsIcon } from "@hugeicons/vue";
import {
  Camera01Icon,
  CalculatorIcon,
  Add01Icon,
} from "@hugeicons/core-free-icons";

const { t: $t } = useI18n();
const emit = defineEmits(["addBill", "openOcr"]);

const newBillDescription = ref("");
const newBillAmount = ref("");
const newBillDate = ref(new Date().toISOString().split("T")[0]);

const showCalculator = ref(false);

function applyResult(value) {
  newBillAmount.value = value;
}

function addBill() {
  if (newBillDescription.value.trim()) {
    emit("addBill", {
      description: newBillDescription.value.trim(),
      amount: Number(newBillAmount.value),
      date: newBillDate.value,
    });
    newBillDescription.value = "";
    newBillAmount.value = "";
    newBillDate.value = new Date().toISOString().split("T")[0];
  }
}

function openOcrModal() {
  emit("openOcr");
}
</script>

<template>
  <div
    class="bg-white rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100/50 mb-8"
  >
    <div class="flex items-center justify-between mb-6">
      <h2
        class="text-[11px] font-black text-neutral-400 uppercase tracking-[0.15em]"
      >
        {{ $t("bills.addNewExpense") }}
      </h2>
      <button
        @click="openOcrModal"
        class="text-[10px] font-black text-primary hover:text-primary-dark transition-colors uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5 active:scale-95"
        :title="$t('ocr.scanReceipt')"
      >
        <HugeiconsIcon :icon="Camera01Icon" size="14" stroke-width="2.5" />
        {{ $t("bills.scan") }}
      </button>
    </div>

    <div class="space-y-5">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label
            for="bill-description"
            class="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2"
            >{{ $t("bills.description") }}</label
          >
          <input
            id="bill-description"
            v-model="newBillDescription"
            type="text"
            :placeholder="$t('bills.descriptionPlaceholder')"
            class="w-full px-4 py-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-neutral-700 placeholder-neutral-300"
          />
        </div>
        <div class="relative">
          <label
            for="bill-amount"
            class="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2"
            >{{ $t("bills.amount") }}</label
          >
          <input
            id="bill-amount"
            v-model="newBillAmount"
            type="number"
            min="0"
            :placeholder="$t('bills.amountPlaceholder')"
            class="w-full pl-4 pr-10 py-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-black text-neutral-700 placeholder-neutral-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            @keypress="preventNonNumberInput"
          />
          <button
            @click="showCalculator = true"
            class="absolute right-3 top-9 p-1 text-neutral-400 hover:text-primary transition-colors flex items-center justify-center"
          >
            <HugeiconsIcon
              :icon="CalculatorIcon"
              size="20"
              stroke-width="2.5"
            />
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            for="bill-date"
            class="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2"
            >{{ $t("bills.date") }}</label
          >
          <input
            id="bill-date"
            v-model="newBillDate"
            type="date"
            class="w-full px-4 h-[54px] py-0 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-neutral-600 cursor-pointer appearance-none"
          />
        </div>
        <div class="flex items-end">
          <button
            @click="addBill"
            :disabled="!newBillDescription.trim() || !newBillAmount"
            class="w-full bg-neutral-800 text-white font-black text-[11px] uppercase tracking-widest py-4 px-6 rounded-2xl hover:bg-neutral-900 transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <HugeiconsIcon :icon="Add01Icon" size="16" stroke-width="3" />
            {{ $t("bills.addExpense") }}
          </button>
        </div>
      </div>
    </div>

    <Calculator v-model="showCalculator" @apply="applyResult" />
  </div>
</template>
