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
    newBillDate.value = "";
  }
}

function removeBill(billId) {
  billStore.removeBill(billId);
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
  <div class="mt-8">
    <div class="flex flex-row gap-2">
      <div class="basis-2/3">
        <input
          v-model="newBillDescription"
          type="text"
          placeholder="รายการบิล"
          class="input input-bordered w-full"
        />
      </div>
      <div class="basis-1/3">
        <input
          v-model="newBillAmount"
          type="number"
          placeholder="จำนวนเงิน"
          class="input input-bordered w-full"
        />
      </div>
    </div>
    <div class="flex flex-row gap-2 mt-4">
      <div class="basis-1/2">
        <input
          v-model="newBillDate"
          type="date"
          class="input input-bordered w-full"
        />
      </div>
      <button
        @click="addBill"
        class="btn btn-success ml-auto text-white basis-1/2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        เพิ่มบิล
      </button>
    </div>

    <div class="space-y-4 mt-4">
      <div
        v-for="bill in billStore.bills"
        :key="bill.id"
        class="bg-base-100 rounded-lg shadow-sm overflow-hidden"
      >
        <div class="p-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-semibold">{{ bill.description }}</h3>
            <span class="text-xl font-bold">{{ bill.amount }} บาท</span>
          </div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-500">{{ bill.date }}</span>
          </div>
          <div class="flex flex-wrap items-center mt-2 space-x-2">
            <button
              @click="removeBill(bill.id)"
              class="btn btn-error btn-sm text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5 mr-1"
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
              class="btn btn-primary btn-sm text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5 mr-1"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
              แก้ไข
            </button>
          </div>
        </div>
        <div class="bg-base-200 p-4">
          <h4 class="font-semibold mb-2">ผู้จ่าย:</h4>
          <div class="flex flex-wrap gap-2">
            <span v-if="bill.payers.length === 0" class="text-gray-500">
              ยังไม่มี
            </span>
            <span
              v-for="payer in bill.payers"
              :key="payer.name"
              class="badge badge-outline"
            >
              {{ payer.name }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div
    v-if="editingBillId !== null"
    class="fixed inset-0 z-50 flex items-center justify-center overflow-x-auto overflow-y-auto bg-gray-500 bg-opacity-75"
  >
    <div class="bg-base-100 rounded-lg p-6 max-w-md w-full mx-4">
      <h3 class="text-2xl font-bold mb-4">แก้ไขบิล</h3>
      <div class="space-y-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">รายละเอียดบิล</span>
          </label>
          <input
            v-model="editedBillDescription"
            type="text"
            class="input input-bordered w-full"
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">จำนวนเงิน</span>
          </label>
          <input
            v-model="editedBillAmount"
            type="number"
            class="input input-bordered w-full"
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">วันที่</span>
          </label>
          <input
            v-model="editedBillDate"
            type="date"
            class="input input-bordered w-full"
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">เลือกคนจ่าย</span>
          </label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <span
              v-for="person in peopleStore.list"
              :key="person.name"
              class="cursor-pointer px-3 py-2 rounded-full text-center text-sm"
              :class="
                selectedPeople.includes(person.name)
                  ? 'bg-primary text-primary-content'
                  : 'bg-base-200 hover:bg-base-300'
              "
              @click="menuPeoplePay(person)"
            >
              {{ person.name }}
            </span>
          </div>
        </div>
      </div>
      <div class="flex justify-end mt-6 space-x-2">
        <button @click="closeModal" class="btn btn-outline">ยกเลิก</button>
        <button @click="saveEditedBill" class="btn btn-primary">บันทึก</button>
      </div>
    </div>
  </div>
</template>
