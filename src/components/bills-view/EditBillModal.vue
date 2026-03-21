<script setup>
import { ref, watch } from "vue";
import { useBillStore } from "../../stores/Bills";
import { usePeopleStore } from "../../stores/People";
import { useI18n } from "vue-i18n";
import { preventNonNumberInput } from "../../utils/common";
import Calculator from "../common/Calculator.vue";

const { t: $t } = useI18n();
const billStore = useBillStore();
const peopleStore = usePeopleStore();

const emit = defineEmits(["close"]);

const props = defineProps({
  bill: {
    type: Object,
    default: null,
  },
});

const editedBillDescription = ref("");
const editedBillAmount = ref("");
const editedBillDate = ref("");
const selectedPeople = ref([]);
const showCalculator = ref(false);

function applyResult(value) {
  editedBillAmount.value = value;
}

watch(
  () => props.bill,
  (newBill) => {
    if (newBill) {
      editedBillDescription.value = newBill.description;
      editedBillAmount.value = newBill.amount.toString();
      editedBillDate.value = newBill.date;
      selectedPeople.value = newBill.payers.map((payer) => payer.name);
    }
  },
  { immediate: true }
);

function saveEditedBill() {
  if (!editedBillDescription.value.trim()) {
    alert($t("messages.enterDescription"));
    return;
  }

  try {
    const initialPaidStatus = selectedPeople.value.map((personName) => ({
      name: personName,
      paid: peopleStore.getPaidStatusByDate(personName, editedBillDate.value),
    }));

    const originalBill = billStore.bills.find(
      (bill) => bill.id === props.bill.id
    );
    if (!originalBill) {
      alert($t("messages.billNotFound"));
      return;
    }

    const originalPayers = originalBill.payers
      ? originalBill.payers.map((payer) => payer.name)
      : [];

    // Update bill basic info
    const updateSuccess = billStore.updateBill(
      props.bill.id,
      editedBillDescription.value.trim(),
      Number(editedBillAmount.value),
      editedBillDate.value
    );

    if (!updateSuccess) {
      alert($t("messages.failedUpdateBill"));
      return;
    }

    // Clear existing payers
    billStore.removeAllPayersFromBill(props.bill.id);

    // Add selected payers
    selectedPeople.value.forEach((person) => {
      billStore.addPayerToBill(props.bill.id, person);
    });

    const anyUnpaid = selectedPeople.value.some((personName) => {
      const personPaidStatus = initialPaidStatus.find(
        (payer) => payer.name === personName
      );
      return personPaidStatus && !personPaidStatus.paid;
    });

    const allPayers = new Set([...originalPayers, ...selectedPeople.value]);

    allPayers.forEach((personName) => {
      const wasPayer = originalPayers.includes(personName);
      const isPayer = selectedPeople.value.includes(personName);
      const personPaidStatus = initialPaidStatus.find(
        (payer) => payer.name === personName
      );

      if (wasPayer && isPayer) {
        peopleStore.resetPaidStatus(
          [personName],
          editedBillDate.value,
          personPaidStatus ? personPaidStatus.paid : false
        );
      } else if (isPayer) {
        peopleStore.resetPaidStatus(
          [personName],
          editedBillDate.value,
          !anyUnpaid
        );
      } else if (wasPayer) {
        peopleStore.resetPaidStatus([personName], editedBillDate.value, false);
      }
    });

    closeModal();
  } catch (error) {
    console.error("Error saving edited bill:", error);
    alert($t("messages.errorSavingData"));
  }
}

function closeModal() {
  emit("close");
}

function menuPeoplePay(person) {
  const index = selectedPeople.value.indexOf(person.name);
  if (index === -1) {
    selectedPeople.value.push(person.name);
  } else {
    selectedPeople.value.splice(index, 1);
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="bill"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        @click="closeModal"
      ></div>

      <!-- Modal -->
      <div
        class="relative bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-lg p-8 animate-modalIn border border-white/20 max-h-[90vh] overflow-y-auto"
      >
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-2xl font-black text-neutral-800 tracking-tight">
            {{ $t("bills.editExpense") }}
          </h2>
          <button
            @click="closeModal"
            class="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors"
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
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="space-y-6 mb-8">
          <div>
            <label
              for="edit-description"
              class="block text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-3"
              >{{ $t("bills.description") }}</label
            >
            <input
              id="edit-description"
              v-model="editedBillDescription"
              type="text"
              :placeholder="$t('bills.descriptionPlaceholder')"
              class="w-full px-5 py-4 rounded-2xl bg-neutral-50 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-neutral-700 placeholder-neutral-300"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="relative">
              <label
                for="edit-amount"
                class="block text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-3"
                >{{ $t("bills.amount") }}</label
              >
              <input
                id="edit-amount"
                v-model="editedBillAmount"
                type="number"
                min="0"
                :placeholder="$t('bills.amountPlaceholder')"
                class="w-full pl-5 pr-10 py-4 rounded-2xl bg-neutral-50 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-black text-neutral-700 placeholder-neutral-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                @keypress="preventNonNumberInput"
              />
              <button
                @click="showCalculator = true"
                class="absolute right-3 top-10 p-1 text-neutral-400 hover:text-primary transition-colors"
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
                    d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm0 2.25h.008v.008H8.25v-.008ZM10.5 7.125h-3v1.5m3-1.5v1.5m-3-1.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H13.5m-3.75 0V7.125m0 0h-3"
                  />
                </svg>
              </button>
            </div>
            <div>
              <label
                for="edit-date"
                class="block text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-3"
                >{{ $t("bills.date") }}</label
              >
              <input
                id="edit-date"
                v-model="editedBillDate"
                type="date"
                class="w-full px-5 py-4 rounded-2xl bg-neutral-50 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-neutral-600 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label
              class="block text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-3"
              >{{ $t("bills.sharedWith") }}</label
            >
            <div
              class="bg-neutral-50 border border-neutral-100 rounded-2xl p-4"
            >
              <div
                v-if="peopleStore.list.length === 0"
                class="text-[11px] font-bold uppercase tracking-widest text-neutral-400 text-center py-2"
              >
                {{ $t("messages.noPeopleYet") }}
              </div>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="person in peopleStore.list"
                  :key="person.name"
                  @click="menuPeoplePay(person)"
                  class="flex items-center px-4 py-2 rounded-xl cursor-pointer transition-all duration-200 border-2"
                  :class="
                    selectedPeople.includes(person.name)
                      ? 'bg-primary/10 border-primary/20 shadow-sm'
                      : 'bg-white border-transparent hover:border-neutral-200 shadow-sm'
                  "
                >
                  <div
                    class="w-5 h-5 rounded-md flex items-center justify-center border-2 mr-2 transition-colors"
                    :class="
                      selectedPeople.includes(person.name)
                        ? 'bg-primary border-primary'
                        : 'bg-white border-neutral-300'
                    "
                  >
                    <svg
                      v-if="selectedPeople.includes(person.name)"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      class="w-3.5 h-3.5 text-white"
                      stroke-width="3"
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m5 12 5 5L20 7"
                      ></path>
                    </svg>
                  </div>
                  <span class="text-sm font-black text-neutral-700">{{
                    person.name
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-4">
          <button
            @click="saveEditedBill"
            class="flex-1 bg-neutral-800 text-white font-black text-[12px] uppercase tracking-widest py-4 px-6 rounded-2xl hover:bg-neutral-900 transition-all active:scale-95 shadow-lg"
          >
            {{ $t("actions.saveChanges") }}
          </button>
        </div>
      </div>
      <Calculator v-model="showCalculator" @apply="applyResult" />
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-modalIn {
  animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
