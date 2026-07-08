<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
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

const { t: $t, locale } = useI18n();

onMounted(() => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedDataParam = urlParams.get("payer_info");

    if (!sharedDataParam) {
      error.value = $t("shared.notFound");
      loading.value = false;
      return;
    }

    try {
      const decompressedData =
        LZString.decompressFromEncodedURIComponent(sharedDataParam);
      const parsedData = JSON.parse(decompressedData);

      if (!parsedData || !parsedData.payers) {
        throw new Error($t("shared.invalidFormat"));
      }

      allSharedData.value = parsedData;

      if (parsedData.promptpayID) {
        overallPromptpayID.value = parsedData.promptpayID;
      }

      if (parsedData.locale) {
        locale.value = parsedData.locale;
      }

      loading.value = false;
    } catch (lzError) {
      console.warn(
        "Failed to decompress with LZString, trying legacy format:",
        lzError,
      );

      try {
        const decodedInfo = decodeURIComponent(atob(sharedDataParam));
        const parsedData = JSON.parse(decodedInfo);

        if (!parsedData || !parsedData.payers) {
          error.value = "Invalid data or no payers found";
          loading.value = false;
          return;
        }

        allSharedData.value = parsedData;

        if (parsedData.promptpayID) {
          overallPromptpayID.value = parsedData.promptpayID;
        }

        if (parsedData.locale) {
          locale.value = parsedData.locale;
        }

        loading.value = false;
      } catch (legacyError) {
        throw legacyError;
      }
    }
  } catch (e) {
    console.error("Error parsing shared data:", e);
    error.value = $t("shared.loadError");
    loading.value = false;
  }
});

const specificAmount = ref(null);
const specificTitle = ref("");
const specificPromptpayID = ref("");

const openPaymentModal = (
  payer,
  amount = null,
  title = "",
  promptpayID = "",
) => {
  if (payer.paid && amount === null) {
    alert($t("shared.alreadySettled"));
    return;
  }
  showQrCodeModalForPayer.value = payer;
  specificAmount.value = amount;
  specificTitle.value = title;
  specificPromptpayID.value = promptpayID || "";
};

const closePaymentModal = () => {
  showQrCodeModalForPayer.value = null;
  specificAmount.value = null;
  specificTitle.value = "";
  specificPromptpayID.value = "";
};
</script>

<template>
  <div class="space-y-8 pb-12 max-w-lg mx-auto">
    <div
      class="bg-white dark:bg-neutral-800 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100/50 dark:border-neutral-700/50"
    >
      <h1
        class="text-3xl font-black text-neutral-800 dark:text-white tracking-tight mb-2"
      >
        {{ $t("shared.title") }}
      </h1>
      <p
        class="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-6"
      >
        {{ $t("shared.header") }}
      </p>
      <div
        class="bg-orange-50 dark:bg-orange-900/30 border border-orange-100 dark:border-orange-800/50 p-4 rounded-2xl flex gap-3"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          :stroke-width="2.5"
          stroke="currentColor"
          class="w-5 h-5 text-orange-500 shrink-0"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
        <span
          class="text-sm font-bold text-orange-700 dark:text-orange-300 leading-snug"
          >{{ $t("shared.note") }}</span
        >
      </div>
    </div>

    <!-- Loading State -->
    <SharedLoadingState v-if="loading" />

    <!-- Error State -->
    <SharedErrorState v-else-if="error" :error="error" />

    <!-- All Payers Data Display -->
    <div
      v-else-if="
        allSharedData && allSharedData.payers && allSharedData.payers.length > 0
      "
      class="space-y-4"
    >
      <SharedPayerCard
        v-for="payer in allSharedData.payers"
        :key="payer.name"
        :payer="payer"
        :overallPromptpayID="overallPromptpayID"
        @open-payment-modal="openPaymentModal"
      />
    </div>

    <!-- No Data State -->
    <SharedEmptyState v-else />

    <!-- Payment QR Code Modal -->
    <PaymentQRModal
      :payer="showQrCodeModalForPayer"
      :promptpayID="specificPromptpayID || overallPromptpayID"
      :is-visible="!!showQrCodeModalForPayer"
      :amount="specificAmount"
      :title="specificTitle"
      @close="closePaymentModal"
    />
  </div>
</template>
