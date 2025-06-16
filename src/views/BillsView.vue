<script setup>
import { ref } from "vue";
import { useBillStore } from "../stores/Bills";
import AddBillForm from "../components/bills-view/AddBillForm.vue";
import BillsList from "../components/bills-view/BillsList.vue";
import EditBillModal from "../components/bills-view/EditBillModal.vue";
import OCRModal from "../components/bills-view/OCRModal.vue";

const billStore = useBillStore();

const editingBill = ref(null);
const showOcrModal = ref(false);

function handleAddBill(billData) {
  billStore.addBill(
    billData.description,
    billData.amount,
    billData.date
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
  <div>
    <!-- Add Bill Form -->
    <AddBillForm 
      @add-bill="handleAddBill"
      @open-ocr="handleOpenOcr"
    />

    <!-- Bills List -->
    <BillsList 
      @edit-bill="handleEditBill"
    />
    
    <!-- Edit Modal -->
    <EditBillModal 
      :bill="editingBill"
      @close="handleCloseEditModal"
    />

    <!-- OCR Modal -->
    <OCRModal 
      :show="showOcrModal"
      @close="handleCloseOcrModal"
    />
  </div>
</template>


