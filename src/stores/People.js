import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const usePeopleStore = defineStore('people', () => {
  const list = ref(JSON.parse(localStorage.getItem('peopleList')) || []);

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
    list.value.splice(index, 1);
    saveToLocalStorage();
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
