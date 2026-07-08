<script setup>
import { ref, defineAsyncComponent } from "vue";
import { useBillGroupsStore } from "../stores/BillGroups";
import AddBillForm from "../components/bills-view/AddBillForm.vue";
import BillsList from "../components/bills-view/BillsList.vue";

const EditBillModal = defineAsyncComponent(
  () => import("../components/bills-view/EditBillModal.vue"),
);
const OCRModal = defineAsyncComponent(
  () => import("../components/bills-view/OCRModal.vue"),
);

const groupsStore = useBillGroupsStore();

const editingBill = ref(null);
const showOcrModal = ref(false);

function handleAddBill(billData) {
  groupsStore.addBill(
    billData.description,
    billData.amount,
    billData.date,
    billData.icon,
  );
}

function handleOpenOcr() {
  showOcrModal.value = true;
}

function handleEditBill(bill) {
  editingBill.value = bill;
}

function handleCloseEditModal() {
  editingBill.value = null;
}

function handleCloseOcrModal() {
  showOcrModal.value = false;
}
</script>

<template>
  <div
    v-motion
    :initial="{ opacity: 0, scale: 0.97, y: 15 }"
    :enter="{
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 220, damping: 24 },
    }"
  >
    <!-- Add Bill Form -->
    <AddBillForm @add-bill="handleAddBill" @open-ocr="handleOpenOcr" />

    <!-- Bills List -->
    <BillsList @edit-bill="handleEditBill" />

    <!-- Edit Modal -->
    <EditBillModal :bill="editingBill" @close="handleCloseEditModal" />

    <!-- OCR Modal -->
    <OCRModal :show="showOcrModal" @close="handleCloseOcrModal" />
  </div>
</template>
