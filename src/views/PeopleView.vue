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
  <div class="mt-8">
    <div class="flex flex-wrap gap-4 mt-4">
      <div class="form-control mb-4 flex-grow">
        <input
          v-model="newPersonName"
          type="text"
          placeholder="ชื่อคนจ่าย"
          class="input input-bordered w-full"
        />
      </div>
      <button @click="addPerson" class="btn btn-outline btn-success">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
          />
        </svg>
      </button>
    </div>
    <ul 
    v-if="peopleStore.list.length > 0"
    class="list-disc bg-base-100 rounded-lg shadow-sm p-4"
  >
    <li
      v-for="(person, index) in peopleStore.list"
      :key="index"
      class="flex items-center justify-between mb-2"
    >
      <span :class="{ 'text-2xl': true , 'line-through': person.paid }">{{ person.name }}</span>
      <div class="flex items-center space-x-2">
        <button @click="removePerson(index)" class="btn btn-outline btn-error btn-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
            />
          </svg>
        </button>
      </div>
    </li>
  </ul>
  </div>
</template>
