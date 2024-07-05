import { ref, computed } from "vue";
import { useBillStore } from "./Bills";
import { defineStore } from "pinia";

export const usePeopleStore = defineStore("people", () => {
  const list = ref(JSON.parse(localStorage.getItem("peopleList")) || []);
  const billStore = useBillStore();

  function saveToLocalStorage() {
    localStorage.setItem("peopleList", JSON.stringify(list.value));
  }

  function add(name) {
    if (!list.value.some((person) => person.name === name)) {
      list.value.push({ name, paid: false, dates: {} });
      saveToLocalStorage();
    }
  }

  function remove(index) {
    const removedPerson = list.value[index];
    list.value.splice(index, 1);
    saveToLocalStorage();
    billStore.removePayerFromAllBills(removedPerson.name);
  }

  function togglePaidStatus(name, date) {
    const person = list.value.find((p) => p.name === name);
    if (person) {
      if (!person.dates) person.dates = {};
      person.dates[date] = !person.dates[date];
      updateOverallPaidStatus(person);
      saveToLocalStorage();
    }
  }

  function resetPaidStatus(payers, date, boolean) {
    payers.forEach((payer) => {
      const person = list.value.find((p) => p.name === payer);
      if (person) {
        if (!person.dates) person.dates = {};
        person.dates[date] = boolean;
        updateOverallPaidStatus(person); 
        saveToLocalStorage();
      }
    });
  }

  function updateOverallPaidStatus(person) {
    const allDates = Object.keys(billStore.payerAmounts[person.name] || {});
    person.paid = allDates.every((date) => person.dates[date]);
  }

  function getPaidStatusByDate(personName, date) {
    const person = list.value.find((p) => p.name === personName);
    return person && person.dates ? person.dates[date] || false : false;
  }

  const listWithStatus = computed(() => {
    return list.value.map((person) => ({
      name: person.name,
      paid: person.paid,
      dates: person.dates || {},
    }));
  });

  return {
    list: listWithStatus,
    add,
    remove,
    togglePaidStatus,
    resetPaidStatus,
    getPaidStatusByDate,
    saveToLocalStorage,
  };
});
