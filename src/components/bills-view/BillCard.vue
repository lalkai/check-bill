<script setup>
import { usePeopleStore } from "../../stores/People";

import { useI18n } from "vue-i18n";

const { t: $t } = useI18n();
const peopleStore = usePeopleStore();

const emit = defineEmits(["remove", "edit"]);

import { formatCurrency } from "../../utils/common";

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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2.5"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            />
          </svg>
        </div>
        <div class="flex flex-col pt-0.5">
          <h3
            class="text-lg font-black text-neutral-800 tracking-tight break-words leading-tight"
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
      <div class="flex flex-col items-end pt-0.5">
        <span
          class="text-2xl font-black text-neutral-800 flex-shrink-0 whitespace-nowrap tracking-tight"
        >
          <span class="text-lg opacity-60 mr-0.5">฿</span
          >{{ formatCurrency(bill.amount) }}
        </span>
      </div>
    </div>

    <!-- Payers List -->
    <div class="mt-2 pt-4 border-t border-dashed border-neutral-100">
      <div class="flex items-center justify-between">
        <div class="flex flex-wrap gap-2">
          <div
            v-for="payer in bill.payers"
            :key="payer.name"
            class="inline-flex items-center bg-neutral-100 text-neutral-600 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wide border border-neutral-200"
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
            class="p-2 rounded-xl bg-neutral-50 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            :title="$t('actions.edit')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2.5"
              stroke="currentColor"
              class="w-4 h-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
          </button>
          <button
            @click="removeBill"
            class="p-2 rounded-xl bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors"
            :title="$t('actions.delete')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2.5"
              stroke="currentColor"
              class="w-4 h-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
