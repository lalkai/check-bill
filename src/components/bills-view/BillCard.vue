<script setup>
import { usePeopleStore } from "../../stores/People";

import { useI18n } from "vue-i18n";

const { t: $t } = useI18n();
const peopleStore = usePeopleStore();

const emit = defineEmits(["remove", "edit"]);

import { formatCurrency } from "../../utils/common";
import { HugeiconsIcon } from "@hugeicons/vue";
import {
  Invoice01Icon,
  PencilEdit01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";

const props = defineProps({
  bill: {
    type: Object,
    required: true,
  },
});

function removeBill() {
  if (props.bill.payers && props.bill.payers.length > 0) {
    if (confirm($t("messages.confirmDeleteBillWithPayers"))) {
      props.bill.payers.forEach((payer) => {
        peopleStore.resetPaidStatus([payer.name], props.bill.date, false);
      });
      emit("remove", props.bill);
    }
  } else {
    emit("remove", props.bill);
  }
}

function editBill() {
  emit("edit", props.bill);
}
</script>

<template>
  <div
    class="bg-white p-6 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-neutral-100 flex flex-col gap-4 group transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5"
  >
    <div
      class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0"
    >
      <div class="flex-1 min-w-0 flex items-start gap-4">
        <div
          class="w-12 h-12 rounded-2xl bg-blue-50 flex-shrink-0 flex items-center justify-center text-blue-500 border border-blue-100/50 group-hover:scale-110 transition-transform"
        >
          <HugeiconsIcon :icon="Invoice01Icon" size="20" stroke-width="2.5" />
        </div>
        <div class="flex flex-col pt-0.5 flex-1 min-w-0">
          <h3
            class="text-lg font-black text-neutral-800 tracking-tight truncate w-full leading-tight"
          >
            {{ bill.description }}
          </h3>
          <div
            class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1"
          >
            {{ bill.date }}
          </div>
        </div>
      </div>
      <div
        class="flex flex-col items-end pt-0.5 flex-shrink-0 min-w-0 max-w-[40%]"
      >
        <span
          class="text-2xl font-black text-neutral-800 flex-shrink-0 whitespace-nowrap tracking-tight truncate w-full text-right"
        >
          <span class="text-lg opacity-60 mr-0.5">฿</span
          >{{ formatCurrency(bill.amount) }}
        </span>
      </div>
    </div>

    <!-- Payers List -->
    <div class="mt-2 pt-4 border-t border-dashed border-neutral-100">
      <div class="flex items-center justify-between">
        <div
          class="flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide flex-1 min-w-0"
        >
          <div
            v-for="payer in bill.payers"
            :key="payer.name"
            class="flex-shrink-0 inline-block bg-neutral-100 text-neutral-600 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wide border border-neutral-200 truncate max-w-[120px] align-middle"
          >
            {{ payer.name }}
          </div>
          <div
            v-if="bill.payers.length === 0"
            class="text-[10px] font-bold uppercase tracking-widest text-neutral-300 py-1.5"
          >
            {{ $t("bills.noPayersYet") }}
          </div>
        </div>

        <div
          class="flex items-center gap-2 transition-opacity duration-200 opacity-100 ml-4"
        >
          <button
            @click="editBill"
            class="p-2 rounded-xl bg-neutral-50 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors flex items-center justify-center"
            :title="$t('actions.edit')"
          >
            <HugeiconsIcon
              :icon="PencilEdit01Icon"
              size="16"
              stroke-width="2.5"
            />
          </button>
          <button
            @click="removeBill"
            class="p-2 rounded-xl bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center"
            :title="$t('actions.delete')"
          >
            <HugeiconsIcon :icon="Delete02Icon" size="16" stroke-width="2.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
