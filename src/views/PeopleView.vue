<script setup>
import { ref } from "vue";
import { usePeopleStore } from "../stores/People";
import { useBillStore } from "../stores/Bills";

const peopleStore = usePeopleStore();
const billStore = useBillStore();
const newPersonName = ref("");

function addPerson() {
  if (newPersonName.value.trim()) {
    peopleStore.add(newPersonName.value.trim());
    newPersonName.value = "";
  }
}

function removePerson(index) {
  const personName = peopleStore.list[index].name;
  const billsWithPerson = billStore.bills.filter(bill =>
    bill.payers.some(payer => payer.name === personName)
  );

  if (billsWithPerson.length > 0) {
    const billDescriptions = billsWithPerson.map(bill => bill.description).join(", ");
    const confirmMessage = `คุณ ${personName} มีชื่ออยู่ในบิล: [${billDescriptions}] การลบอาจส่งผลต่อการคำนวณค่าใช้จ่าย คุณต้องการลบ ${personName} จริงหรือไม่?`;

    if (confirm(confirmMessage)) {
      peopleStore.remove(index);
      billsWithPerson.forEach(bill => {
        billStore.removePayerFromBill(bill.id, personName);
      });
    }
  } else {
    peopleStore.remove(index);
  }
}
</script>

<template>
  <div>
    <!-- Add Person Card -->
    <div class="a-card mb-6">
      <h2 class="a-header mb-4">เพิ่มคนจ่าย</h2>
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-grow">
          <input
            v-model="newPersonName"
            type="text"
            placeholder="ชื่อคนจ่าย"
            class="a-input"
            @keyup.enter="addPerson"
          />
        </div>
        <button @click="addPerson" class="a-button-success min-w-24 w-full sm:w-auto flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5 mr-1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
            />
          </svg>
          เพิ่ม
        </button>
      </div>
    </div>
    
    <!-- People List -->
    <div class="a-card" v-if="peopleStore.list.length > 0">
      <h2 class="a-header">รายชื่อทั้งหมด</h2>
      <ul class="divide-y divide-neutral-200">
        <li
          v-for="(person, index) in peopleStore.list"
          :key="index"
          class="py-4 first:pt-0 last:pb-0 flex items-center justify-between"
        >
          <div class="flex items-center">
            <div class="bg-primary/10 text-primary rounded-full p-2 mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
            </div>
            <span class="text-lg font-medium text-neutral-700 break-words">{{ person.name }}</span>
          </div>
          <button 
            @click="removePerson(index)" 
            class="ml-2 p-2 text-neutral-400 hover:text-error transition-colors flex-shrink-0"
            aria-label="ลบคนนี้"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </button>
        </li>
      </ul>
    </div>
    
    <div v-if="peopleStore.list.length === 0" class="a-card">
      <div class="text-center py-8 text-neutral-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto mb-2 opacity-50">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
        <p class="text-lg">ยังไม่มีรายชื่อคนจ่าย</p>
        <p class="text-sm">เพิ่มรายชื่อคนจ่ายได้ด้านบน</p>
      </div>
    </div>
  </div>
</template>
