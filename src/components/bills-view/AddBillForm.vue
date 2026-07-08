<script setup>
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { preventNonNumberInput, getTodayDate } from "../../utils/common";
import Calculator from "../common/Calculator.vue";
import IconPicker from "../common/IconPicker.vue";
import SectionLabel from "../common/SectionLabel.vue";
import { HugeiconsIcon } from "@hugeicons/vue";
import {
  Camera01Icon,
  Calculator01Icon,
  Add01Icon,
} from "@hugeicons/core-free-icons";

const { t: $t } = useI18n();
const emit = defineEmits(["addBill", "openOcr"]);

const newBillDescription = ref("");
const newBillAmount = ref("");
const newBillDate = ref(getTodayDate());
const selectedIcon = ref("general");
const newBillServiceCharge = ref("");
const newBillVat = ref("");
const taxPreset = ref("0");

const showCalculator = ref(false);

const finalTotalPreview = computed(() => {
  const subtotal = Number(newBillAmount.value) || 0;
  const sc = Number(newBillServiceCharge.value) || 0;
  const vat = Number(newBillVat.value) || 0;
  return subtotal * (1 + sc / 100) * (1 + vat / 100);
});

const hasTaxOrSC = computed(() => {
  const sc = Number(newBillServiceCharge.value) || 0;
  const vat = Number(newBillVat.value) || 0;
  return sc > 0 || vat > 0;
});

const finalTotalLabel = computed(() => {
  const sc = Number(newBillServiceCharge.value) || 0;
  const vat = Number(newBillVat.value) || 0;
  if (sc > 0 && vat > 0) {
    return $t("bills.totalPreviewBoth");
  } else if (sc > 0) {
    return $t("bills.totalPreviewSC");
  } else if (vat > 0) {
    return $t("bills.totalPreviewVAT");
  }
  return $t("bills.totalAmount");
});

function selectPreset(preset) {
  taxPreset.value = preset;
  if (preset === "0") {
    newBillServiceCharge.value = "";
    newBillVat.value = "";
  } else if (preset === "sc10") {
    newBillServiceCharge.value = "10";
    newBillVat.value = "";
  } else if (preset === "vat7") {
    newBillServiceCharge.value = "";
    newBillVat.value = "7";
  } else if (preset === "both") {
    newBillServiceCharge.value = "10";
    newBillVat.value = "7";
  } else if (preset === "custom") {
    newBillServiceCharge.value = "";
    newBillVat.value = "";
  }
}

watch([newBillServiceCharge, newBillVat], ([sc, vat]) => {
  if (taxPreset.value === "custom") {
    return;
  }
  const scNum = Number(sc) || 0;
  const vatNum = Number(vat) || 0;
  if (scNum === 0 && vatNum === 0) {
    taxPreset.value = "0";
  } else if (scNum === 10 && vatNum === 0) {
    taxPreset.value = "sc10";
  } else if (scNum === 0 && vatNum === 7) {
    taxPreset.value = "vat7";
  } else if (scNum === 10 && vatNum === 7) {
    taxPreset.value = "both";
  } else {
    taxPreset.value = "custom";
  }
});

function applyResult(value) {
  newBillAmount.value = value;
}

function addBill() {
  if (newBillDescription.value.trim()) {
    emit("addBill", {
      description: newBillDescription.value.trim(),
      amount: Number(newBillAmount.value) || 0,
      date: newBillDate.value,
      icon: selectedIcon.value,
      serviceCharge: Number(newBillServiceCharge.value) || 0,
      vat: Number(newBillVat.value) || 0,
    });
    newBillDescription.value = "";
    newBillAmount.value = "";
    newBillDate.value = getTodayDate();
    selectedIcon.value = "general";
    newBillServiceCharge.value = "";
    newBillVat.value = "";
    taxPreset.value = "0";
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
      <SectionLabel>{{ $t("bills.addNewExpense") }}</SectionLabel>
      <button
        @click="openOcrModal"
        class="text-[10px] font-black text-primary hover:text-primary-dark transition-colors uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5 active:scale-95 cursor-pointer"
        :title="$t('ocr.scanReceipt')"
      >
        <HugeiconsIcon :icon="Camera01Icon" size="14" :stroke-width="2.5" />
        {{ $t("bills.scan") }}
      </button>
    </div>

    <div class="space-y-5" v-auto-animate>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label
            for="bill-description"
            class="block text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-2"
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
            class="block text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-2"
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
            class="absolute right-3 top-9 p-1 text-neutral-400 hover:text-primary transition-colors flex items-center justify-center cursor-pointer"
          >
            <HugeiconsIcon
              :icon="Calculator01Icon"
              size="20"
              :stroke-width="2.5"
            />
          </button>
        </div>
      </div>

      <!-- Tax/SC Quick Segment Control -->
      <div>
        <label
          class="block text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-3"
        >
          {{ $t("bills.taxScPreset") }}
        </label>
        <div
          class="flex sm:flex-wrap gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide"
        >
          <button
            type="button"
            @click="selectPreset('0')"
            class="px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all active:scale-95 cursor-pointer flex-shrink-0"
            :class="
              taxPreset === '0'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300'
            "
          >
            {{ $t("bills.normalPreset") }}
          </button>
          <button
            type="button"
            @click="selectPreset('sc10')"
            class="px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all active:scale-95 cursor-pointer flex-shrink-0"
            :class="
              taxPreset === 'sc10'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300'
            "
          >
            SC 10%
          </button>
          <button
            type="button"
            @click="selectPreset('vat7')"
            class="px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all active:scale-95 cursor-pointer flex-shrink-0"
            :class="
              taxPreset === 'vat7'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300'
            "
          >
            VAT 7%
          </button>
          <button
            type="button"
            @click="selectPreset('both')"
            class="px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all active:scale-95 cursor-pointer flex-shrink-0"
            :class="
              taxPreset === 'both'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300'
            "
          >
            SC 10% + VAT 7% (++)
          </button>
          <button
            type="button"
            @click="selectPreset('custom')"
            class="px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all active:scale-95 cursor-pointer flex-shrink-0"
            :class="
              taxPreset === 'custom'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300'
            "
          >
            {{ $t("bills.custom") }}
          </button>
        </div>
      </div>

      <!-- Expandable Custom SC & VAT Inputs -->
      <div v-if="taxPreset === 'custom'" class="grid grid-cols-2 gap-4">
        <div>
          <label
            for="bill-service-charge"
            class="block text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-2"
            >{{ $t("bills.serviceCharge") }}</label
          >
          <input
            id="bill-service-charge"
            v-model="newBillServiceCharge"
            type="number"
            min="0"
            placeholder="0"
            class="w-full px-4 py-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-neutral-700 placeholder-neutral-300"
            @keypress="preventNonNumberInput"
          />
        </div>
        <div>
          <label
            for="bill-vat"
            class="block text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-2"
            >{{ $t("bills.vat") }}</label
          >
          <input
            id="bill-vat"
            v-model="newBillVat"
            type="number"
            min="0"
            placeholder="0"
            class="w-full px-4 py-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-neutral-700 placeholder-neutral-300"
            @keypress="preventNonNumberInput"
          />
        </div>
      </div>

      <!-- Live Total Preview -->
      <div
        v-if="finalTotalPreview > 0 && hasTaxOrSC"
        class="bg-neutral-50 rounded-2xl p-4 border border-neutral-100/50 flex items-center justify-between text-sm"
      >
        <span class="font-bold text-neutral-500">{{ finalTotalLabel }}</span>
        <span class="font-black text-primary text-base"
          >฿{{
            finalTotalPreview.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          }}</span
        >
      </div>

      <!-- Icon Selector -->
      <div>
        <label
          class="block text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-2.5"
          >{{ $t("bills.icon") }}</label
        >
        <IconPicker v-model="selectedIcon" layout="chips" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            for="bill-date"
            class="block text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-2"
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
            :disabled="!newBillDescription.trim()"
            class="w-full bg-neutral-800 text-white font-black text-[11px] uppercase tracking-widest py-4 px-6 rounded-2xl hover:bg-neutral-900 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <HugeiconsIcon :icon="Add01Icon" size="16" :stroke-width="3" />
            {{ $t("bills.addExpense") }}
          </button>
        </div>
      </div>
    </div>

    <Calculator v-model="showCalculator" @apply="applyResult" />
  </div>
</template>
