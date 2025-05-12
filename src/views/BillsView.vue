<script setup>
import { ref } from "vue";
import { useBillStore } from "../stores/Bills";
import { usePeopleStore } from "../stores/People";

const billStore = useBillStore();
const peopleStore = usePeopleStore();

const newBillDescription = ref("");
const newBillAmount = ref("");
const newBillDate = ref(new Date().toISOString().split('T')[0]);
const editingBillId = ref(null);
const editedBillDescription = ref("");
const editedBillAmount = ref("");
const editedBillDate = ref("");
const selectedPeople = ref([]);

function addBill() {
  if (newBillDescription.value.trim()) {
    billStore.addBill(
      newBillDescription.value.trim(),
      Number(newBillAmount.value),
      newBillDate.value
    );
    newBillDescription.value = "";
    newBillAmount.value = "";
    newBillDate.value = new Date().toISOString().split('T')[0];
  }
}

function removeBill(bill) {
  billStore.removeBill(bill.id);
}

function openEditModal(bill) {
  editingBillId.value = bill.id;
  editedBillDescription.value = bill.description;
  editedBillAmount.value = bill.amount.toString();
  editedBillDate.value = bill.date;
  selectedPeople.value = bill.payers.map((payer) => payer.name);
}

function saveEditedBill() {
  if (editedBillDescription.value.trim()) {
    const initialPaidStatus = selectedPeople.value.map(personName => ({
      name: personName,
      paid: peopleStore.getPaidStatusByDate(personName, editedBillDate.value)
    }));

    const originalBill = billStore.bills.find(bill => bill.id === editingBillId.value);
    const originalPayers = originalBill ? originalBill.payers.map(payer => payer.name) : [];

    billStore.updateBill(
      editingBillId.value,
      editedBillDescription.value.trim(),
      Number(editedBillAmount.value),
      editedBillDate.value
    );

    billStore.removeAllPayersFromBill(editingBillId.value);

    selectedPeople.value.forEach((person) => {
      billStore.addPayerToBill(editingBillId.value, person);
    });

    const anyUnpaid = selectedPeople.value.some(personName => {
      const personPaidStatus = initialPaidStatus.find(payer => payer.name === personName);
      return personPaidStatus && !personPaidStatus.paid;
    });

    const allPayers = new Set([...originalPayers, ...selectedPeople.value]);

    allPayers.forEach(personName => {
      const wasPayer = originalPayers.includes(personName);
      const isPayer = selectedPeople.value.includes(personName);
      const personPaidStatus = initialPaidStatus.find(payer => payer.name === personName);
      
      if (wasPayer && isPayer) {
        peopleStore.resetPaidStatus([personName], editedBillDate.value, personPaidStatus ? personPaidStatus.paid : false);
      } else if (isPayer) {
        peopleStore.resetPaidStatus([personName], editedBillDate.value, !anyUnpaid);
      } else if (wasPayer) {
        peopleStore.resetPaidStatus([personName], editedBillDate.value, false);
      }
    });

    closeModal();
  }
}

function closeModal() {
  editingBillId.value = null;
  editedBillDescription.value = "";
  editedBillAmount.value = "";
  editedBillDate.value = "";
  selectedPeople.value = [];
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
  <div>
    <!-- Add Bill Form Card -->
    <div class="a-card mb-6">
      <h2 class="a-header">เพิ่มบิลใหม่</h2>
      
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="bill-description" class="block text-sm font-medium text-neutral-500 mb-1">รายการ</label>
            <input
              id="bill-description"
              v-model="newBillDescription"
              type="text"
              placeholder="รายการบิล"
              class="a-input"
            />
          </div>
          <div>
            <label for="bill-amount" class="block text-sm font-medium text-neutral-500 mb-1">จำนวนเงิน</label>
            <input
              id="bill-amount"
              v-model="newBillAmount"
              type="number"
              placeholder="จำนวนเงิน"
              class="a-input"
            />
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="bill-date" class="block text-sm font-medium text-neutral-500 mb-1">วันที่</label>
            <input
              id="bill-date"
              v-model="newBillDate"
              type="date"
              class="a-input"
            />
          </div>
          <div class="flex items-end">
            <button
              @click="addBill"
              class="a-button-primary w-full"
            >
              <div class="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                เพิ่มบิล
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bills List -->
    <div class="space-y-4">
      <div v-if="billStore.bills.length === 0" class="a-card py-12">
        <div class="text-center text-neutral-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto mb-2 opacity-50">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <p class="text-lg">ยังไม่มีรายการบิล</p>
          <p class="text-sm">เพิ่มรายการบิลแรกของคุณด้านบน</p>
        </div>
      </div>
      
      <div
        v-for="bill in billStore.bills"
        :key="bill.id"
        class="a-card"
      >
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0">
          <div>
            <h3 class="text-lg font-medium text-neutral-700">{{ bill.description }}</h3>
            <div class="flex items-center mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-neutral-400 mr-1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              <span class="text-sm text-neutral-500">{{ bill.date }}</span>
            </div>
          </div>
          <span class="text-xl font-semibold text-neutral-700">{{ bill.amount }} บาท</span>
        </div>
        
        <div class="flex flex-wrap items-center mt-4 gap-3">
          <button
            @click="removeBill(bill)"
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
            @click="openEditModal(bill)"
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
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              {{ payer.name }}
            </div>
            <div v-if="bill.payers.length === 0" class="text-sm text-neutral-400">
              ยังไม่มีคนจ่าย
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Edit Modal -->
    <div v-if="editingBillId" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end sm:items-center justify-center min-h-screen sm:p-0 px-4 pt-4 pb-10">
        <!-- Background overlay -->
        <div class="fixed inset-0 bg-neutral-700/75 transition-opacity" aria-hidden="true" @click="closeModal"></div>

        <!-- Modal panel -->
        <div class="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full sm:max-w-lg">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 sm:mt-0 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-neutral-700" id="modal-title">
                  <div class="text-center">
                      แก้ไขบิล
                  </div>
                </h3>
                <div class="mt-4">
                  <div class="space-y-4">
                    <div>
                      <label for="edit-description" class="block text-sm font-medium text-neutral-500 mb-1">รายการ</label>
                      <input
                        id="edit-description"
                        v-model="editedBillDescription"
                        type="text"
                        class="a-input"
                      />
                    </div>
                    <div>
                      <label for="edit-amount" class="block text-sm font-medium text-neutral-500 mb-1">จำนวนเงิน</label>
                      <input
                        id="edit-amount"
                        v-model="editedBillAmount"
                        type="number"
                        class="a-input"
                      />
                    </div>
                    <div>
                      <label for="edit-date" class="block text-sm font-medium text-neutral-500 mb-1">วันที่</label>
                      <input
                        id="edit-date"
                        v-model="editedBillDate"
                        type="date"
                        class="a-input"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-neutral-500 mb-1">คนจ่าย</label>
                      <div class="border border-neutral-300 rounded-lg p-3 bg-neutral-50">
                        <div class="flex flex-wrap gap-2">
                          <div 
                            v-for="person in peopleStore.list" 
                            :key="person.name"
                            @click="menuPeoplePay(person)"
                            class="flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-neutral-200/50 transition-colors"
                            :class="{ 'bg-primary/10': selectedPeople.includes(person.name) }"
                          >
                            <div class="flex-shrink-0 w-5 h-5 border border-neutral-300 rounded flex items-center justify-center"
                                 :class="{ 'bg-primary border-primary': selectedPeople.includes(person.name) }">
                              <svg v-if="selectedPeople.includes(person.name)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4 h-4 text-white">
                                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="m5 12 5 5L20 7"></path>
                              </svg>
                            </div>
                            <span class="ml-2 text-neutral-700">{{ person.name }}</span>
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
            <button type="button" 
                    class="a-button-primary" 
                    @click="saveEditedBill">
              บันทึก
            </button>
            <button type="button" 
                    class="a-button-secondary" 
                    @click="closeModal">
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
