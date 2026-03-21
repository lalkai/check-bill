import { computed } from "vue";
import { defineStore } from "pinia";
import { useBillGroupsStore } from "./BillGroups";

export const useBillStore = defineStore("bill", () => {
  const groupsStore = useBillGroupsStore();
  const bills = computed(() => groupsStore.activeBills);

  function saveToLocalStorage() {
    groupsStore.saveToLocalStorage();
  }

  function addBill(description, amount, date) {
    return groupsStore.addBill(description, amount, date);
  }

  function removeBill(billId, peopleStore = null) {
    return groupsStore.removeBill(billId);
  }

  function addPayerToBill(billId, payerName) {
    return groupsStore.addPayerToBill(billId, payerName);
  }

  function removePayerFromBill(billId, payerName) {
    groupsStore.removePayerFromBill(billId, payerName);
  }

  function removePayerFromAllBills(payerName) {
    groupsStore.removePayerFromAllBills(payerName);
  }

  function togglePayerStatus(billId, payerName) {
    groupsStore.togglePayerStatus(billId, payerName);
  }

  function updateBill(billId, description, amount, date) {
    return groupsStore.updateBill(billId, description, amount, date);
  }

  function removeAllPayersFromBill(billId) {
    groupsStore.removeAllPayersFromBill(billId);
  }

  function clearAllBills() {
    groupsStore.clearAllBills();
  }

  const payerAmounts = computed(() => groupsStore.payerAmounts);
  const totalAmount = computed(() => groupsStore.totalAmount);

  return {
    bills,
    addBill,
    removeBill,
    addPayerToBill,
    removePayerFromBill,
    removePayerFromAllBills,
    togglePayerStatus,
    updateBill,
    removeAllPayersFromBill,
    clearAllBills,
    payerAmounts,
    totalAmount,
  };
});
