import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { applyRounding } from "../utils/common";

const COLOR_PALETTE = [
  "#0066cc",
  "#30d158",
  "#ff453a",
  "#ff9f0a",
  "#bf5af2",
  "#64d2ff",
  "#ff6482",
  "#ac8e68",
  "#5e5ce6",
  "#eb4d3d",
];

export { COLOR_PALETTE };

export const useBillGroupsStore = defineStore("billGroups", () => {
  const STORAGE_KEY = "billGroups";

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  function createEmptyGroup(name, color, icon) {
    return {
      id: generateId(),
      name: name || "บิลใหม่",
      color: color || COLOR_PALETTE[0],
      icon: icon || "general",
      bills: [],
      people: [],
      ownerName: "",
      promptpayID: "",
      roundingMode: "none",
      createdAt: new Date().toISOString(),
    };
  }

  function migrateLegacyData() {
    const legacyBills = localStorage.getItem("billList");
    const legacyPeople = localStorage.getItem("peopleList");

    if (!legacyBills && !legacyPeople) return null;

    try {
      const bills = legacyBills ? JSON.parse(legacyBills) : [];
      const people = legacyPeople ? JSON.parse(legacyPeople) : [];

      if (
        (!Array.isArray(bills) || bills.length === 0) &&
        (!Array.isArray(people) || people.length === 0)
      ) {
        return null;
      }

      const group = createEmptyGroup("บิลเดิม", COLOR_PALETTE[0]);

      group.bills = (Array.isArray(bills) ? bills : [])
        .map((bill) => ({
          id: bill.id || generateId(),
          description: String(bill.description || "").trim(),
          amount: Number(bill.amount) || 0,
          date: bill.date || new Date().toISOString().split("T")[0],
          icon: bill.icon || "general",
          payers: Array.isArray(bill.payers)
            ? bill.payers.map((p) => ({
                name: String(p.name || "").trim(),
                paid: Boolean(p.paid),
              }))
            : [],
        }))
        .filter((b) => b.description);

      group.people = (Array.isArray(people) ? people : [])
        .map((person) => ({
          name: String(person.name || "").trim(),
          paid: Boolean(person.paid),
          dates:
            typeof person.dates === "object" && person.dates !== null
              ? person.dates
              : {},
        }))
        .filter((p) => p.name);

      localStorage.removeItem("billList");
      localStorage.removeItem("peopleList");

      return group;
    } catch (e) {
      console.error("Error migrating legacy data:", e);
      return null;
    }
  }

  function initializeGroups() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure icons exist for existing loaded groups/bills
          // Migrate per-bill promptpayID to group level
          parsed.forEach(group => {
            if (!group.promptpayID) group.promptpayID = "";
            if (!group.roundingMode) group.roundingMode = "none";
            if (group.bills) {
              group.bills.forEach(bill => {
                if (!bill.icon) bill.icon = "general";
                if (bill.serviceCharge === undefined) bill.serviceCharge = 0;
                if (bill.vat === undefined) bill.vat = 0;
                // Migrate per-bill promptpayID to group level
                if (bill.promptpayID && !group.promptpayID) {
                  group.promptpayID = bill.promptpayID;
                }
                delete bill.promptpayID;
              });
            }
          });
          return parsed;
        }
      }

      const migratedGroup = migrateLegacyData();
      if (migratedGroup) {
        const groups = [migratedGroup];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
        return groups;
      }

      return [];
    } catch (e) {
      console.error("Error loading bill groups:", e);
      return [];
    }
  }

  const groups = ref(initializeGroups());
  const activeGroupId = ref(null);
  const roundingMode = ref(localStorage.getItem("roundingMode") || "none");

  function setRoundingMode(mode) {
    roundingMode.value = mode;
    localStorage.setItem("roundingMode", mode);
  }

  function saveToLocalStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(groups.value));
    } catch (e) {
      console.error("Error saving bill groups:", e);
    }
  }

  const activeGroup = computed(() => {
    if (!activeGroupId.value) return null;
    return groups.value.find((g) => g.id === activeGroupId.value) || null;
  });

  function addGroup(name, color, icon) {
    const group = createEmptyGroup(name, color, icon);
    groups.value.push(group);
    saveToLocalStorage();
    return group;
  }

  function removeGroup(groupId) {
    const idx = groups.value.findIndex((g) => g.id === groupId);
    if (idx !== -1) {
      groups.value.splice(idx, 1);
      if (activeGroupId.value === groupId) {
        activeGroupId.value = null;
      }
      saveToLocalStorage();
      return true;
    }
    return false;
  }

  function updateGroup(groupId, updates) {
    const group = groups.value.find((g) => g.id === groupId);
    if (!group) return false;
    if (updates.name !== undefined)
      group.name = String(updates.name).trim() || group.name;
    if (updates.color !== undefined) group.color = updates.color;
    if (updates.icon !== undefined) group.icon = updates.icon;
    saveToLocalStorage();
    return true;
  }

  function setActiveGroup(groupId) {
    activeGroupId.value = groupId;
  }

  function setGroupOwner(ownerName) {
    const group = activeGroup.value;
    if (group) {
      group.ownerName = group.ownerName === ownerName ? "" : ownerName;
      saveToLocalStorage();
    }
  }

  function setGroupPromptpayID(promptpayID) {
    const group = activeGroup.value;
    if (group) {
      group.promptpayID = promptpayID || "";
      saveToLocalStorage();
    }
  }

  function addBill(description, amount, date, icon = "general", serviceCharge = 0, vat = 0) {
    const group = activeGroup.value;
    if (!group) return false;

    const clean = String(description || "").trim();
    if (!clean) return false;

    group.bills.push({
      id: generateId(),
      description: clean,
      amount: Number(amount) || 0,
      serviceCharge: Number(serviceCharge) || 0,
      vat: Number(vat) || 0,
      date: date || new Date().toISOString().split("T")[0],
      icon: icon || "general",
      payers: [],
    });
    saveToLocalStorage();
    return true;
  }

  function removeBill(billId) {
    const group = activeGroup.value;
    if (!group) return false;
    const idx = group.bills.findIndex((b) => b.id === billId);
    if (idx !== -1) {
      group.bills.splice(idx, 1);
      cleanUpDatesForGroup(group);
      saveToLocalStorage();
      return true;
    }
    return false;
  }

  function updateBill(billId, description, amount, date, icon, serviceCharge = 0, vat = 0) {
    const group = activeGroup.value;
    if (!group) return false;
    const bill = group.bills.find((b) => b.id === billId);
    if (!bill) return false;

    const clean = String(description || "").trim();
    if (!clean) return false;

    bill.description = clean;
    bill.amount = Number(amount) || 0;
    bill.date = date || bill.date;
    if (icon !== undefined) {
      bill.icon = icon || "general";
    }
    if (serviceCharge !== undefined) {
      bill.serviceCharge = Number(serviceCharge) || 0;
    }
    if (vat !== undefined) {
      bill.vat = Number(vat) || 0;
    }
    saveToLocalStorage();
    return true;
  }

  function addPayerToBill(billId, payerName) {
    const group = activeGroup.value;
    if (!group) return false;
    const bill = group.bills.find((b) => b.id === billId);
    if (!bill) return false;
    const cleanName = String(payerName || "").trim();
    if (!cleanName) return false;
    if (bill.payers.some((p) => p.name === cleanName)) return true;
    bill.payers.push({ name: cleanName, paid: false });
    saveToLocalStorage();
    return true;
  }

  function removePayerFromBill(billId, payerName) {
    const group = activeGroup.value;
    if (!group) return;
    const bill = group.bills.find((b) => b.id === billId);
    if (bill) {
      bill.payers = bill.payers.filter((p) => p.name !== payerName);
      saveToLocalStorage();
    }
  }

  function removePayerFromAllBills(payerName) {
    const group = activeGroup.value;
    if (!group) return;
    group.bills.forEach((bill) => {
      bill.payers = bill.payers.filter((p) => p.name !== payerName);
    });
    saveToLocalStorage();
  }

  function togglePayerStatus(billId, payerName) {
    const group = activeGroup.value;
    if (!group) return;
    const bill = group.bills.find((b) => b.id === billId);
    if (bill) {
      const payer = bill.payers.find((p) => p.name === payerName);
      if (payer) {
        payer.paid = !payer.paid;

        // Derive person.dates[date] from bills (single source of truth)
        const person = group.people.find((p) => p.name === payerName);
        if (person) {
          recalcPersonDateStatus(person, payerName, bill.date);
          updateOverallPaidStatus(person);
        }
        saveToLocalStorage();
      }
    }
  }

  function removeAllPayersFromBill(billId) {
    const group = activeGroup.value;
    if (!group) return;
    const bill = group.bills.find((b) => b.id === billId);
    if (bill) {
      bill.payers = [];
      saveToLocalStorage();
    }
  }

  function clearAllBills() {
    const group = activeGroup.value;
    if (!group) return;
    group.bills = [];
    saveToLocalStorage();
  }

  function addPerson(name) {
    const group = activeGroup.value;
    if (!group) return;
    if (!group.people.some((p) => p.name === name)) {
      group.people.push({ name, paid: false, dates: {} });
      saveToLocalStorage();
    }
  }

  function removePerson(name) {
    const group = activeGroup.value;
    if (!group) return null;
    const idx = group.people.findIndex((p) => p.name === name);
    if (idx !== -1) {
      const removed = group.people[idx];
      group.people.splice(idx, 1);
      saveToLocalStorage();
      return removed;
    }
    return null;
  }

  function togglePaidStatus(name, date) {
    const group = activeGroup.value;
    if (!group) return;
    const person = group.people.find((p) => p.name === name);
    if (person) {
      if (!person.dates) person.dates = {};

      // Determine the new status by checking current state
      const currentStatus = getPaidStatusByDate(name, date);
      const newStatus = !currentStatus;

      // First: toggle ALL bills for this person on this date
      group.bills.forEach((bill) => {
        if (bill.date === date) {
          const payer = bill.payers.find((p) => p.name === name);
          if (payer) {
            payer.paid = newStatus;
          }
        }
      });

      // Then: derive person.dates[date] from bills (single source of truth)
      recalcPersonDateStatus(person, name, date);
      updateOverallPaidStatus(person);
      saveToLocalStorage();
    }
  }

  function resetPaidStatus(payers, date, boolean) {
    const group = activeGroup.value;
    if (!group) return;
    payers.forEach((payerName) => {
      const person = group.people.find((p) => p.name === payerName);
      // First: update all bills for this date
      group.bills.forEach((bill) => {
        if (bill.date === date) {
          const payer = bill.payers.find((p) => p.name === payerName);
          if (payer) {
            payer.paid = boolean;
          }
        }
      });
      // Then: derive person.dates[date] from bills
      if (person) {
        recalcPersonDateStatus(person, payerName, date);
        updateOverallPaidStatus(person);
      }
    });
    saveToLocalStorage();
  }

  function updateOverallPaidStatus(person) {
    const datesArray = Object.values(person.dates || {});
    person.paid = datesArray.length > 0 && datesArray.every((paid) => paid);
  }

  function recalcPersonDateStatus(person, personName, date) {
    const group = activeGroup.value;
    if (!group) return;
    const dateBills = group.bills.filter(
      (b) =>
        b.date === date && b.payers.some((p) => p.name === personName)
    );
    const allPaid = dateBills.every((b) => {
      const pi = b.payers.find((p) => p.name === personName);
      return pi ? pi.paid : true;
    });
    if (!person.dates) person.dates = {};
    person.dates[date] = allPaid;
  }

  function getPaidStatusByDate(personName, date) {
    const group = activeGroup.value;
    if (!group) return false;
    const person = group.people.find((p) => p.name === personName);
    return person && person.dates ? person.dates[date] || false : false;
  }

  function cleanUpDatesForGroup(group) {
    if (!group) return;
    group.people.forEach((person) => {
      if (person.dates) {
        const validDates = {};
        Object.keys(person.dates).forEach((date) => {
          const hasActiveBills = group.bills.some(
            (bill) =>
              bill.date === date &&
              bill.payers.some((p) => p.name === person.name)
          );
          if (hasActiveBills) {
            validDates[date] = person.dates[date];
          }
        });
        person.dates = validDates;
        updateOverallPaidStatus(person);
      }
    });
  }

  function cleanUpDatesWithoutBills() {
    const group = activeGroup.value;
    if (!group) return;
    cleanUpDatesForGroup(group);
    saveToLocalStorage();
  }

  const activeBills = computed(() => {
    return activeGroup.value ? activeGroup.value.bills : [];
  });

  const activePeople = computed(() => {
    if (!activeGroup.value) return [];
    return activeGroup.value.people.map((person) => ({
      name: person.name,
      paid: person.paid,
      dates: person.dates || {},
    }));
  });

  const payerAmounts = computed(() => {
    const group = activeGroup.value;
    if (!group) return {};
    const amounts = {};
    group.bills.forEach((bill) => {
      const serviceChargeRatio = 1 + (bill.serviceCharge || 0) / 100;
      const vatRatio = 1 + (bill.vat || 0) / 100;
      const rawSplitAmount = bill.payers.length
        ? (bill.amount / bill.payers.length) * serviceChargeRatio * vatRatio
        : 0;
      const splitAmount = applyRounding(rawSplitAmount, roundingMode.value);
      bill.payers.forEach((payer) => {
        if (!amounts[payer.name]) amounts[payer.name] = {};
        if (!amounts[payer.name][bill.date]) amounts[payer.name][bill.date] = 0;
        amounts[payer.name][bill.date] += splitAmount;
      });
    });
    return amounts;
  });

  const totalAmount = computed(() => {
    const group = activeGroup.value;
    if (!group) return 0;
    return group.bills.reduce((total, bill) => {
      const serviceChargeRatio = 1 + (bill.serviceCharge || 0) / 100;
      const vatRatio = 1 + (bill.vat || 0) / 100;
      return total + bill.amount * serviceChargeRatio * vatRatio;
    }, 0);
  });

  function getGroupTotalAmount(groupId) {
    const group = groups.value.find((g) => g.id === groupId);
    if (!group) return 0;
    return group.bills.reduce((total, bill) => {
      const serviceChargeRatio = 1 + (bill.serviceCharge || 0) / 100;
      const vatRatio = 1 + (bill.vat || 0) / 100;
      return total + bill.amount * serviceChargeRatio * vatRatio;
    }, 0);
  }

  function getGroupBillCount(groupId) {
    const group = groups.value.find((g) => g.id === groupId);
    return group ? group.bills.length : 0;
  }

  function getGroupPeopleCount(groupId) {
    const group = groups.value.find((g) => g.id === groupId);
    return group ? group.people.length : 0;
  }


  return {
    // Group management
    groups,
    activeGroupId,
    activeGroup,
    addGroup,
    removeGroup,
    updateGroup,
    setActiveGroup,
    setGroupOwner,
    setGroupPromptpayID,
    getGroupTotalAmount,
    getGroupBillCount,
    getGroupPeopleCount,

    // Bill actions
    activeBills,
    addBill,
    removeBill,
    updateBill,
    addPayerToBill,
    removePayerFromBill,
    removePayerFromAllBills,
    togglePayerStatus,
    removeAllPayersFromBill,
    clearAllBills,

    // People actions
    activePeople,
    addPerson,
    removePerson,
    togglePaidStatus: togglePaidStatus,
    resetPaidStatus,
    getPaidStatusByDate,
    cleanUpDatesWithoutBills,

    // Computed
    payerAmounts,
    totalAmount,
    totalAllGroupsAmount: computed(() => {
      return groups.value.reduce((total, group) => {
        return (
          total +
          (group.bills || []).reduce((t, b) => {
            const serviceChargeRatio = 1 + (b.serviceCharge || 0) / 100;
            const vatRatio = 1 + (b.vat || 0) / 100;
            return t + (Number(b.amount) || 0) * serviceChargeRatio * vatRatio;
          }, 0)
        );
      }, 0);
    }),

    // Persistence
    saveToLocalStorage,

    // Rounding settings
    roundingMode,
    setRoundingMode,

    COLOR_PALETTE,
  };
});
