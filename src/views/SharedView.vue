<script setup>
import { ref, onMounted } from "vue";
import LZString from "lz-string";
import SharedPayerCard from "@/components/shared-view/SharedPayerCard.vue";
import PaymentQRModal from "@/components/shared-view/PaymentQRModal.vue";
import SharedLoadingState from "@/components/shared-view/SharedLoadingState.vue";
import SharedErrorState from "@/components/shared-view/SharedErrorState.vue";
import SharedEmptyState from "@/components/shared-view/SharedEmptyState.vue";

const allSharedData = ref(null);
const error = ref(null);
const loading = ref(true);
const showQrCodeModalForPayer = ref(null);
const overallPromptpayID = ref("");

onMounted(() => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedDataParam = urlParams.get('payer_info');

    if (!sharedDataParam) {
      error.value = "ไม่พบข้อมูลที่แชร์";
      loading.value = false;
      return;
    }

    try {
      const decompressedData = LZString.decompressFromEncodedURIComponent(sharedDataParam);
      const parsedData = JSON.parse(decompressedData);

      if (!parsedData || !parsedData.payers) {
        throw new Error("Invalid data format");
      }

      allSharedData.value = parsedData;

      if (parsedData.promptpayID) {
        overallPromptpayID.value = parsedData.promptpayID;
      }

      loading.value = false;
    } catch (lzError) {
      console.warn("Failed to decompress with LZString, trying legacy format:", lzError);

      try {
        const decodedInfo = decodeURIComponent(atob(sharedDataParam));
        const parsedData = JSON.parse(decodedInfo);

        if (!parsedData || !parsedData.payers) {
          error.value = "ข้อมูลไม่ถูกต้อง หรือไม่มีข้อมูลผู้จ่าย";
          loading.value = false;
          return;
        }

        allSharedData.value = parsedData;

        if (parsedData.promptpayID) {
          overallPromptpayID.value = parsedData.promptpayID;
        }

        loading.value = false;
      } catch (legacyError) {
        throw legacyError;
      }
    }
  } catch (e) {
    console.error("Error parsing shared data:", e);
    error.value = "เกิดข้อผิดพลาดในการแสดงข้อมูล";
    loading.value = false;
  }
});

const openPaymentModal = (payer) => {
  if (payer.paid) {
    alert("ผู้จ่ายรายนี้ได้ชำระเงินครบถ้วนแล้ว");
    return;
  }
  showQrCodeModalForPayer.value = payer;
};

const closePaymentModal = () => {
  showQrCodeModalForPayer.value = null;
};

</script>

<template>
  <div>
    <div class="a-card mb-6">
      <h1 class="text-xl font-bold text-neutral-700">ข้อมูลการชำระเงิน</h1>
      <p class="text-yellow-600 text-sm mt-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="w-4 h-4 inline-block mr-1">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
        <span>โปรดทราบ: ข้อมูลการชำระเงินที่แชร์ไปจะไม่อัพเดทอัตโนมัติ</span>
      </p>
    </div>

    <!-- Loading State -->
    <SharedLoadingState v-if="loading" />

    <!-- Error State -->
    <SharedErrorState v-else-if="error" :error="error" />

    <!-- All Payers Data Display -->
    <div v-else-if="allSharedData && allSharedData.payers && allSharedData.payers.length > 0" class="space-y-6">
      <SharedPayerCard 
        v-for="payer in allSharedData.payers" 
        :key="payer.name"
        :payer="payer"
        :overall-promptpay-id="overallPromptpayID"
        @open-payment-modal="openPaymentModal"
      />
    </div>

    <!-- No Data State -->
    <SharedEmptyState v-else />

    <!-- Payment QR Code Modal -->
    <PaymentQRModal
      :payer="showQrCodeModalForPayer"
      :promptpay-id="overallPromptpayID"
      :is-visible="!!showQrCodeModalForPayer"
      @close="closePaymentModal"
    />
  </div>
</template>
