import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useBillStore = defineStore('bill', () => {
  const bills = ref(JSON.parse(localStorage.getItem('billList')) || []);

  function saveToLocalStorage() {
    localStorage.setItem('billList', JSON.stringify(bills.value));
  }

  function addBill(description, amount) {
    bills.value.push({
      id: Date.now(),
      description,
      amount,
      payers: []
    });
    saveToLocalStorage();
  }

  function removeBill(billId) {
    bills.value = bills.value.filter(bill => bill.id !== billId);
    saveToLocalStorage();
  }

  function addPayerToBill(billId, payerName) {
    const bill = bills.value.find(bill => bill.id === billId);
    if (bill && !bill.payers.some(payer => payer.name === payerName)) {
      bill.payers.push({ name: payerName, paid: false });
      saveToLocalStorage();
    }
  }

  function removePayerFromBill(billId, payerName) {
    const bill = bills.value.find(bill => bill.id === billId);
    if (bill) {
      bill.payers = bill.payers.filter(payer => payer.name !== payerName);
      saveToLocalStorage();
    }
  }

  function removePayerFromAllBills(payerName) {
    bills.value.forEach(bill => {
      bill.payers = bill.payers.filter(payer => payer.name !== payerName);
    });
    saveToLocalStorage();
  }

  function togglePayerStatus(billId, payerName) {
    const bill = bills.value.find(bill => bill.id === billId);
    if (bill) {
      const payer = bill.payers.find(payer => payer.name === payerName);
      if (payer) {
        payer.paid = !payer.paid;
        saveToLocalStorage();
      }
    }
  }

  function updateBill(billId, description, amount) {
    const bill = bills.value.find(bill => bill.id === billId);
    if (bill) {
      bill.description = description;
      bill.amount = amount;
      saveToLocalStorage();
    }
  }

  function removeAllPayersFromBill(billId) {
    const bill = bills.value.find(bill => bill.id === billId);
    if (bill) {
      bill.payers = [];
      saveToLocalStorage();
    }
  }

  function clearAllBills() {
    bills.value = [];
    saveToLocalStorage();
  }

  const payerAmounts = computed(() => {
    const amounts = {};

    bills.value.forEach(bill => {
      const splitAmount = bill.payers.length ? bill.amount / bill.payers.length : 0;
      bill.payers.forEach(payer => {
        if (!amounts[payer.name]) {
          amounts[payer.name] = 0;
        }
        amounts[payer.name] += splitAmount;
      });
    });

    return amounts;
  });

  const totalAmount = computed(() => {
    return bills.value.reduce((total, bill) => total + bill.amount, 0);
  });

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
    totalAmount
  };
});
