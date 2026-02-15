<script setup>
import { ref, watch } from "vue";
import { useBillStore } from "../../stores/Bills";
import { usePeopleStore } from "../../stores/People";
import { preventNonNumberInput } from "../../utils/common";

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
    alert("กรุณากรอกรายการบิล");
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
      console.error("Original bill not found:", props.bill.id);
      alert("ไม่พบบิลที่ต้องการแก้ไข");
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
      console.error("Failed to update bill");
      alert("ไม่สามารถอัปเดตข้อมูลบิลได้");
      return;
    }

    // Clear existing payers
    billStore.removeAllPayersFromBill(props.bill.id);

    // Add selected payers
    let addedPayersCount = 0;
    selectedPeople.value.forEach((person) => {
      const success = billStore.addPayerToBill(props.bill.id, person);
      if (success) {
        addedPayersCount++;
      } else {
        console.warn("Failed to add payer:", person);
      }
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
    alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองอีกครั้ง");
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
  <div v-if="bill" class="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm" aria-labelledby="modal-title"
    role="dialog" aria-modal="true">
    <div class="flex items-center justify-center min-h-screen sm:p-0 px-4 pt-4 pb-10">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-black/40 transition-opacity" aria-hidden="true" @click="closeModal"></div>

      <!-- Modal panel -->
      <div
        class="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full sm:max-w-lg">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 sm:mt-0 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-neutral-700" id="modal-title">
                <div class="text-center">แก้ไขบิล</div>
              </h3>
              <div class="mt-4">
                <div class="space-y-4">
                  <div>
                    <label for="edit-description" class="block text-sm font-medium text-neutral-500 mb-1">รายการ</label>
                    <input id="edit-description" v-model="editedBillDescription" type="text" class="a-input" />
                  </div>
                  <div>
                    <label for="edit-amount" class="block text-sm font-medium text-neutral-500 mb-1">จำนวนเงิน</label>
                    <input id="edit-amount" v-model="editedBillAmount" type="number" min="0" class="a-input"
                      @keypress="preventNonNumberInput" />
                  </div>
                  <div>
                    <label for="edit-date" class="block text-sm font-medium text-neutral-500 mb-1">วันที่</label>
                    <input id="edit-date" v-model="editedBillDate" type="date" class="a-input" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-neutral-500 mb-1">คนจ่าย</label>
                    <div class="border border-neutral-300 rounded-lg p-3 bg-neutral-50">
                      <div class="flex flex-wrap gap-2">
                        <div v-for="person in peopleStore.list" :key="person.name" @click="menuPeoplePay(person)"
                          class="flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-neutral-200/50 transition-colors"
                          :class="{
                            'bg-primary/10': selectedPeople.includes(
                              person.name
                            ),
                          }">
                          <div
                            class="flex-shrink-0 w-5 h-5 border border-neutral-300 rounded flex items-center justify-center"
                            :class="{
                              'bg-primary border-primary':
                                selectedPeople.includes(person.name),
                            }">
                            <svg v-if="selectedPeople.includes(person.name)" xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24" class="w-4 h-4 text-white">
                              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="3" d="m5 12 5 5L20 7"></path>
                            </svg>
                          </div>
                          <span class="ml-2 text-neutral-700">{{
                            person.name
                            }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-neutral-50 px-4 py-3 sm:px-6 flex flex-row-reverse gap-2">
          <button type="button" class="a-button-primary" @click="saveEditedBill">
            บันทึก
          </button>
          <button type="button" class="a-button-secondary" @click="closeModal">
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
