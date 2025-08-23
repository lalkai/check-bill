<script setup>
import { usePeopleStore } from "../../stores/People";

const peopleStore = usePeopleStore();

const emit = defineEmits(["remove", "edit"]);

const props = defineProps({
  bill: {
    type: Object,
    required: true,
  },
});

function removeBill() {
  if (props.bill.payers && props.bill.payers.length > 0) {
    if (confirm("บิลนี้มีคนจ่ายอยู่ คุณต้องการลบจริงหรือไม่?")) {
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
  <div class="a-card">
    <div
      class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0"
    >
  <div class="flex-1 min-w-0">
        <h3 class="text-lg font-medium text-neutral-700 break-words">
          {{ bill.description }}
        </h3>
        <div class="flex items-center mt-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-4 h-4 text-neutral-400 mr-1"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
            />
          </svg>
          <span class="text-sm text-neutral-500">{{ bill.date }}</span>
        </div>
      </div>
      <span class="text-xl font-semibold text-neutral-700 flex-shrink-0 whitespace-nowrap"
        >{{ bill.amount }} บาท</span
      >
    </div>

    <div class="flex flex-wrap items-center mt-4 gap-3">
      <button
        @click="removeBill"
        class="a-button-danger inline-flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-4 h-4 mr-1"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
          />
        </svg>
        ลบ
      </button>
      <button
        @click="editBill"
        class="a-button-secondary inline-flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-4 h-4 mr-1"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
          />
        </svg>
        รายละเอียด
      </button>
    </div>

    <!-- Payers List -->
    <div class="mt-4 pt-4 border-t border-neutral-200">
      <h4 class="text-sm font-medium text-neutral-500 mb-2">คนจ่าย:</h4>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="payer in bill.payers"
          :key="payer.name"
          class="inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-4 h-4 mr-1"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          {{ payer.name }}
        </div>
        <div v-if="bill.payers.length === 0" class="text-sm text-neutral-400">
          ยังไม่มีคนจ่าย
        </div>
      </div>
    </div>
  </div>
</template>
