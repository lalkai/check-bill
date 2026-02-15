import { computed } from "vue";
import { defineStore } from "pinia";
import { useBillGroupsStore } from './BillGroups';

export const usePeopleStore = defineStore("people", () => {

  const groupsStore = useBillGroupsStore();
  const list = computed(() => groupsStore.activePeople);

  function saveToLocalStorage() {
    groupsStore.saveToLocalStorage();
  }

  function add(name) {
    groupsStore.addPerson(name);
  }

  function remove(index) {
    return groupsStore.removePerson(index);
  }

  function togglePaidStatus(name, date) {
    groupsStore.togglePaidStatus(name, date);
  }

  function resetPaidStatus(payers, date, boolean) {
    groupsStore.resetPaidStatus(payers, date, boolean);
  }

  function getPaidStatusByDate(personName, date) {
    return groupsStore.getPaidStatusByDate(personName, date);
  }

  function cleanUpDatesWithoutBills(billsStoreArg) {
    groupsStore.cleanUpDatesWithoutBills();
  }

  return {
    list,
    add,
    remove,
    togglePaidStatus,
    resetPaidStatus,
    getPaidStatusByDate,
    saveToLocalStorage,
    cleanUpDatesWithoutBills,
  };
});
