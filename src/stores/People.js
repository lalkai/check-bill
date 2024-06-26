import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { useBillStore } from './Bills';  // Import the Bill Store

export const usePeopleStore = defineStore('people', () => {
  const list = ref(JSON.parse(localStorage.getItem('peopleList')) || []);
  const billStore = useBillStore();  // Reference the Bill Store

  function saveToLocalStorage() {
    localStorage.setItem('peopleList', JSON.stringify(list.value));
  }

  function add(name) {
    if (!list.value.some(person => person.name === name)) {
      list.value.push({ name, paid: false });
      saveToLocalStorage();
    }
  }

  function remove(index) {
    const removedPerson = list.value[index];
    list.value.splice(index, 1);
    saveToLocalStorage();
    billStore.removePayerFromAllBills(removedPerson.name); 
  }

  function togglePaidStatus(index) {
    list.value[index].paid = !list.value[index].paid;
    saveToLocalStorage();
  }

  const listWithStatus = computed(() => {
    return list.value.map(person => ({
      name: person.name,
      paid: person.paid
    }));
  });

  return { list: listWithStatus, add, remove, togglePaidStatus };
});
