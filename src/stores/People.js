import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const usePeopleStore = defineStore("people", () => {

  const initializePeople = () => {
    try {
      const stored = localStorage.getItem("peopleList");
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        console.warn('Invalid people data in localStorage, resetting...');
        return [];
      }

      return parsed.map(person => ({
        name: String(person.name || '').trim(),
        paid: Boolean(person.paid),
        dates: typeof person.dates === 'object' && person.dates !== null ? person.dates : {}
      })).filter(person => person.name);
    } catch (error) {
      console.error('Error loading people from localStorage:', error);
      return [];
    }
  };
  const list = ref(initializePeople());

  function saveToLocalStorage() {
    try {
      const validPeople = list.value.filter(person =>
        person &&
        person.name &&
        typeof person.name === 'string'
      );
      localStorage.setItem("peopleList", JSON.stringify(validPeople));
    } catch (error) {
      console.error('Error saving people to localStorage:', error);
    }
  }

  function add(name) {
    if (!list.value.some((person) => person.name === name)) {
      list.value.push({ name, paid: false, dates: {} });
      saveToLocalStorage();
    }
  }
  function remove(index) {
    try {
      const removedPerson = list.value[index]; if (removedPerson) {
        list.value.splice(index, 1);
        saveToLocalStorage();
        return removedPerson;
      }
      return null;
    } catch (error) {
      console.error('Error removing person:', error);
      return null;
    }
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
    const datesArray = Object.values(person.dates || {});
    person.paid = datesArray.length > 0 && datesArray.every(paid => paid);
  }

  function cleanUpDatesWithoutBills(billsStore) {
    list.value.forEach(person => {
      if (person.dates) {
        const validDates = {};
        Object.keys(person.dates).forEach(date => {
          const hasActiveBillsOnDate = billsStore.bills.some(bill =>
            bill.date === date && bill.payers.some(payer => payer.name === person.name)
          );

          if (hasActiveBillsOnDate) {
            validDates[date] = person.dates[date];
          }
        });

        person.dates = validDates;
        updateOverallPaidStatus(person);
      }
    });
    saveToLocalStorage();
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
    cleanUpDatesWithoutBills,
  };
});
