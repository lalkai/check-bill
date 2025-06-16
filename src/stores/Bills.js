import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useBillStore = defineStore('bill', () => {
  // Initialize bills with error handling
  const initializeBills = () => {
    try {
      const stored = localStorage.getItem('billList');
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        console.warn('Invalid bills data in localStorage, resetting...');
        return [];
      }
      
      return parsed.map(bill => ({
        id: bill.id || Date.now() + Math.random(),
        description: String(bill.description || '').trim(),
        amount: Number(bill.amount) || 0,
        date: bill.date || new Date().toISOString().split('T')[0],
        payers: Array.isArray(bill.payers) ? bill.payers.map(payer => ({
          name: String(payer.name || '').trim(),
          paid: Boolean(payer.paid)
        })) : []
      })).filter(bill => bill.description);
    } catch (error) {
      console.error('Error loading bills from localStorage:', error);
      return [];
    }
  };
  const bills = ref(initializeBills());
  
  function saveToLocalStorage() {
    try {
      const validBills = bills.value.filter(bill => 
        bill && 
        typeof bill.id !== 'undefined' && 
        bill.description && 
        typeof bill.amount === 'number' &&
        Array.isArray(bill.payers)
      );
        localStorage.setItem('billList', JSON.stringify(validBills));
    } catch (error) {
      console.error('Error saving bills to localStorage:', error);
    }
  }
  function addBill(description, amount, date) {
    try {
      const cleanDescription = String(description || '').trim();
      const cleanAmount = Number(amount) || 0;
      const cleanDate = date || new Date().toISOString().split('T')[0];
      
      if (!cleanDescription) {
        console.error('Invalid bill description:', description);
        return false;
      }
      
      const newBill = {
        id: Date.now() + Math.random(), 
        description: cleanDescription,
        amount: cleanAmount,
        date: cleanDate,
        payers: []      };
      
      bills.value.push(newBill);
      saveToLocalStorage();
      return true;
    } catch (error) {
      console.error('Error adding bill:', error);
      return false;
    }
  }  function removeBill(billId) {
    try {
      const billToRemove = bills.value.find(bill => bill.id === billId);
      if (billToRemove) {        bills.value = bills.value.filter(bill => bill.id !== billId);
        
        saveToLocalStorage();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing bill:', error);
      return false;
    }
  }
  
  function addPayerToBill(billId, payerName) {
    try {
      const cleanPayerName = String(payerName || '').trim();
      if (!cleanPayerName) {
        console.error('Invalid payer name:', payerName);
        return false;
      }
      
      const bill = bills.value.find(bill => bill.id === billId);
      if (!bill) {
        console.error('Bill not found:', billId);
        return false;
      }
      
      if (!Array.isArray(bill.payers)) {
        console.warn('Invalid payers array, resetting...');
        bill.payers = [];
      }
      if (bill.payers.some(payer => payer.name === cleanPayerName)) {
        return true;
      }
        bill.payers.push({ 
        name: cleanPayerName, 
        paid: false 
      });
      
      saveToLocalStorage();
      return true;
    } catch (error) {
      console.error('Error adding payer to bill:', error);
      return false;
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
  function updateBill(billId, description, amount, date) {
    try {
      const bill = bills.value.find(bill => bill.id === billId);
      if (!bill) {
        console.error('Bill not found for update:', billId);
        return false;
      }
      
      const cleanDescription = String(description || '').trim();
      const cleanAmount = Number(amount) || 0;
      const cleanDate = date || new Date().toISOString().split('T')[0];
      
      if (!cleanDescription) {
        console.error('Invalid description for update:', description);
        return false;
      }
        bill.description = cleanDescription;
      bill.amount = cleanAmount;
      bill.date = cleanDate;
      
      saveToLocalStorage();
      return true;
    } catch (error) {
      console.error('Error updating bill:', error);
      return false;
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
          amounts[payer.name] = {};
        }
        if (!amounts[payer.name][bill.date]) {
          amounts[payer.name][bill.date] = 0;
        }
        amounts[payer.name][bill.date] += splitAmount;
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