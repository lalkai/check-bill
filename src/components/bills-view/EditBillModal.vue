<script setup>
import { ref, computed, watch } from "vue";
import { useBillGroupsStore } from "../../stores/BillGroups";
import { useI18n } from "vue-i18n";
import { preventNonNumberInput, handleFocusIn } from "../../utils/common";
import Calculator from "../common/Calculator.vue";
import CloseButton from "../common/CloseButton.vue";
import IconPicker from "../common/IconPicker.vue";
import { HugeiconsIcon } from "@hugeicons/vue";
import { Tick01Icon, Calculator01Icon, CrownIcon } from "@hugeicons/core-free-icons";
import { useScrollLock } from "../../composables/useScrollLock";

const { t: $t } = useI18n();
const groupsStore = useBillGroupsStore();

const emit = defineEmits(["close"]);

const props = defineProps({
  bill: {
    type: Object,
    default: null,
  },
});
useScrollLock(computed(() => !!props.bill));

const editedBillDescription = ref("");
const editedBillAmount = ref("");
const editedBillDate = ref("");
const editedBillIcon = ref("general");
const selectedPeople = ref([]);
const showCalculator = ref(false);

const ownerName = computed(() => groupsStore.activeGroup?.ownerName || "");

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
      editedBillIcon.value = newBill.icon || "general";
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
      paid: groupsStore.getPaidStatusByDate(personName, editedBillDate.value),
    }));

    const originalBill = groupsStore.activeBills.find(
      (bill) => bill.id === props.bill.id
    );
    if (!originalBill) {
      alert($t("messages.billNotFound"));
      return;
    }

    const originalPayers = originalBill.payers
      ? originalBill.payers.map((payer) => payer.name)
      : [];

    const updateSuccess = groupsStore.updateBill(
      props.bill.id,
      editedBillDescription.value.trim(),
      Number(editedBillAmount.value),
      editedBillDate.value,
      editedBillIcon.value,
    );

    if (!updateSuccess) {
      alert($t("messages.failedUpdateBill"));
      return;
    }

    groupsStore.removeAllPayersFromBill(props.bill.id);

    selectedPeople.value.forEach((person) => {
      groupsStore.addPayerToBill(props.bill.id, person);
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
        groupsStore.resetPaidStatus(
          [personName],
          editedBillDate.value,
          personPaidStatus ? personPaidStatus.paid : false
        );
      } else if (isPayer) {
        groupsStore.resetPaidStatus(
          [personName],
          editedBillDate.value,
          !anyUnpaid
        );
      } else if (wasPayer) {
        groupsStore.resetPaidStatus([personName], editedBillDate.value, false);
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
    <Transition name="modal">
      <div
        v-if="bill"
        class="fixed inset-0 z-50 flex items-end justify-center p-3 sm:p-4 sm:items-center"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          @click="closeModal"
        ></div>

        <!-- Modal -->
        <div
          class="relative bg-white rounded-[2.2rem] sm:rounded-[2.5rem] shadow-[0_24px_60px_rgba(0,0,0,0.18)] w-full max-w-lg border border-white/20 max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
          @focusin="handleFocusIn"
        >
          <!-- Header -->
          <div class="px-8 pt-8 pb-5 flex justify-between items-center border-b border-neutral-100 flex-shrink-0">
            <h2 class="text-2xl font-black text-neutral-800 tracking-tight">
              {{ $t("bills.editExpense") }}
            </h2>
            <CloseButton @click="closeModal" />
          </div>

          <!-- Scrollable body -->
          <div data-scroll-inner class="flex-1 overflow-y-auto scrollbar-hide px-8 py-6 space-y-6">
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
                class="w-full px-5 py-4 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-neutral-700 placeholder-neutral-300"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label
                  for="edit-amount"
                  class="block text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-3"
                  >{{ $t("bills.amount") }}</label
                >
                <div class="relative">
                  <input
                    id="edit-amount"
                    v-model="editedBillAmount"
                    type="number"
                    min="0"
                    :placeholder="$t('bills.amountPlaceholder')"
                    class="w-full pl-5 pr-12 py-4 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none font-black text-neutral-700 placeholder-neutral-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    @keypress="preventNonNumberInput"
                  />
                  <button
                    @click="showCalculator = true"
                    class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-primary transition-colors flex items-center justify-center"
                  >
                    <HugeiconsIcon
                      :icon="Calculator01Icon"
                      size="18"
                      :stroke-width="2.5"
                    />
                  </button>
                </div>
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
                  class="w-full px-5 h-[58px] py-0 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-neutral-600 cursor-pointer appearance-none"
                />
              </div>
            </div>

            <!-- Icon Selector -->
            <div>
              <label
                class="block text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-3"
                >{{ $t("bills.icon") }}</label
              >
              <IconPicker v-model="editedBillIcon" layout="chips" />
            </div>

            <div>
              <label
                class="block text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-3"
                >{{ $t("bills.sharedWith") }}</label
              >
              <div
                class="bg-neutral-50 p-4 rounded-2xl border border-neutral-100"
              >
                <div
                  v-if="groupsStore.activePeople.length === 0"
                  class="text-[11px] font-bold uppercase tracking-widest text-neutral-400 text-center py-2"
                >
                  {{ $t("messages.noPeopleYet") }}
                </div>
                <div class="flex flex-wrap gap-2">
                  <div
                    v-for="person in groupsStore.activePeople"
                    :key="person.name"
                    @click="menuPeoplePay(person)"
                    class="flex items-center px-4 py-2 rounded-xl cursor-pointer transition-all duration-200 border-2"
                    :class="
                      selectedPeople.includes(person.name)
                        ? 'bg-primary/10 border-primary/20 shadow-sm'
                        : 'bg-white border-neutral-200 hover:border-neutral-200 shadow-sm'
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
                      <HugeiconsIcon
                        v-if="selectedPeople.includes(person.name)"
                        :icon="Tick01Icon"
                        size="14"
                        :stroke-width="3"
                        class="text-white"
                      />
                    </div>
                    <span class="text-sm font-black text-neutral-700 flex items-center gap-1.5">
                      {{ person.name }}
                      <HugeiconsIcon
                        v-if="person.name === ownerName"
                        :icon="CrownIcon"
                        size="12"
                        :stroke-width="2.5"
                        class="text-amber-500"
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sticky footer -->
          <div class="px-8 py-5 border-t border-neutral-100 bg-white flex-shrink-0">
            <button
              @click="saveEditedBill"
              class="w-full bg-neutral-800 text-white font-black text-[12px] uppercase tracking-widest py-4 px-6 rounded-2xl hover:bg-neutral-900 transition-all active:scale-95 shadow-lg"
            >
              {{ $t("actions.saveChanges") }}
            </button>
          </div>
        </div>
        <Calculator v-model="showCalculator" @apply="applyResult" />
      </div>
    </Transition>
  </Teleport>
</template>
