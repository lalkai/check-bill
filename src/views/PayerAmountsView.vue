<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import { useI18n } from "vue-i18n";
const { t: $t, locale } = useI18n();
import { useBillGroupsStore } from "../stores/BillGroups";
import { applyRounding } from "../utils/common";
import generatePayload from "promptpay-qr";
import qrcode from "qrcode";
import LZString from "lz-string";
import ToolsSection from "../components/payer-amounts-view/ToolsSection.vue";
import QRCodeDisplay from "../components/payer-amounts-view/QRCodeDisplay.vue";
import PayerCard from "../components/payer-amounts-view/PayerCard.vue";
import AddQRCodeModal from "../components/payer-amounts-view/AddQRCodeModal.vue";
import ShareModal from "../components/payer-amounts-view/ShareModal.vue";
import EmptyState from "../components/payer-amounts-view/EmptyState.vue";
import PayerDetailsModal from "../components/payer-amounts-view/PayerDetailsModal.vue";
import PaymentQRModal from "../components/shared-view/PaymentQRModal.vue";

const groupsStore = useBillGroupsStore();
const selectedDate = ref(null);

const inputPromptpay = ref("");
const showQrCode = ref(false);

const showQrCodeModalForPayer = ref(null);
const specificAmount = ref(null);
const specificTitle = ref("");
const specificPromptpayID = ref("");

const openPaymentModal = (
  payer,
  amount = null,
  title = "",
  promptpayID = "",
) => {
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

const showAddQrCodePopup = ref(false);
const showSharePopup = ref(false);
const showPayerDetails = ref(false);
const selectedPayerName = ref(null);

const shareUrl = ref("");

const filteredPayerAmounts = computed(() => {
  const amounts = groupsStore.payerAmounts;
  const peopleList = groupsStore.activePeople;
  const ownerName = groupsStore.activeGroup?.ownerName || "";

  const allNames = new Set([
    ...peopleList.map((p) => p.name),
    ...Object.keys(amounts),
  ]);

  if (ownerName) {
    allNames.add(ownerName);
  }

  const result = Array.from(allNames).map((name) => {
    const isOwner = name === ownerName;

    if (isOwner) {
      const groupBills = groupsStore.activeBills || [];
      const totalAmountDue = groupBills.reduce(
        (acc, b) => {
          const serviceChargeRatio = 1 + (b.serviceCharge || 0) / 100;
          const vatRatio = 1 + (b.vat || 0) / 100;
          return acc + (b.amount || 0) * serviceChargeRatio * vatRatio;
        },
        0,
      );

      const dates = {};
      groupBills.forEach((b) => {
        const serviceChargeRatio = 1 + (b.serviceCharge || 0) / 100;
        const vatRatio = 1 + (b.vat || 0) / 100;
        if (!dates[b.date]) dates[b.date] = 0;
        dates[b.date] += (b.amount || 0) * serviceChargeRatio * vatRatio;
      });

      return {
        name,
        isOwner: true,
        dates,
        paid: true,
        totalAmountDue,
        unpaidAmountDue: 0,
      };
    } else {
      const payerBills = (groupsStore.activeBills || []).filter((bill) =>
        bill.payers.some((p) => p.name === name),
      );

      const filteredBills = selectedDate.value
        ? payerBills.filter((b) => b.date === selectedDate.value)
        : payerBills;

      const totalAmountDue = filteredBills.reduce((acc, bill) => {
        const serviceChargeRatio = 1 + (bill.serviceCharge || 0) / 100;
        const vatRatio = 1 + (bill.vat || 0) / 100;
        const rawSplit = bill.payers.length ? (bill.amount / bill.payers.length) * serviceChargeRatio * vatRatio : 0;
        const split = applyRounding(rawSplit, groupsStore.roundingMode);
        return acc + split;
      }, 0);

      const unpaidAmountDue = filteredBills.reduce((acc, bill) => {
        const payerInfo = bill.payers.find((p) => p.name === name);
        if (payerInfo && !payerInfo.paid) {
          const serviceChargeRatio = 1 + (bill.serviceCharge || 0) / 100;
          const vatRatio = 1 + (bill.vat || 0) / 100;
          const rawSplit = bill.payers.length
            ? (bill.amount / bill.payers.length) * serviceChargeRatio * vatRatio
            : 0;
          const split = applyRounding(rawSplit, groupsStore.roundingMode);
          return acc + split;
        }
        return acc;
      }, 0);

      const isPaid = totalAmountDue > 0 ? unpaidAmountDue === 0 : false;

      const dates = {};
      filteredBills.forEach((bill) => {
        const serviceChargeRatio = 1 + (bill.serviceCharge || 0) / 100;
        const vatRatio = 1 + (bill.vat || 0) / 100;
        const rawSplit = bill.payers.length ? (bill.amount / bill.payers.length) * serviceChargeRatio * vatRatio : 0;
        const split = applyRounding(rawSplit, groupsStore.roundingMode);
        if (!dates[bill.date]) dates[bill.date] = 0;
        dates[bill.date] += split;
      });

      return {
        name,
        isOwner: false,
        dates,
        paid: isPaid,
        totalAmountDue,
        unpaidAmountDue,
      };
    }
  });

  return result.sort((a, b) => {
    if (a.isOwner) return -1;
    if (b.isOwner) return 1;
    if (!a.paid && b.paid) return -1;
    if (a.paid && !b.paid) return 1;
    return a.name.localeCompare(b.name, "th");
  });
});

const selectedPayerData = computed(() => {
  if (!selectedPayerName.value) return null;
  const name = selectedPayerName.value;
  const payer = filteredPayerAmounts.value.find((p) => p.name === name);
  if (!payer) return null;

  if (payer.isOwner) {
    const billItems = groupsStore.activeBills.map((bill) => {
      const serviceChargeRatio = 1 + (bill.serviceCharge || 0) / 100;
      const vatRatio = 1 + (bill.vat || 0) / 100;
      return {
        id: bill.id,
        description: bill.description,
        amount: bill.amount * serviceChargeRatio * vatRatio,
        date: bill.date,
        icon: bill.icon || "general",
        paid: true,
        isOwnerBill: true,
        payers: bill.payers.map((p) => ({
          name: p.name,
          paid: p.paid,
        })),
      };
    });
    return { ...payer, billItems };
  } else {
    const billItems = groupsStore.activeBills
      .filter((bill) => bill.payers.some((p) => p.name === name))
      .map((bill) => {
        const billPayer = bill.payers.find((p) => p.name === name);
        const serviceChargeRatio = 1 + (bill.serviceCharge || 0) / 100;
        const vatRatio = 1 + (bill.vat || 0) / 100;
        return {
          id: bill.id,
          description: bill.description,
          amount: applyRounding(
            (bill.amount / bill.payers.length) * serviceChargeRatio * vatRatio,
            groupsStore.roundingMode
          ),
          date: bill.date,
          icon: bill.icon || "general",
          paid: billPayer ? billPayer.paid : false,
        };
      });
    return { ...payer, billItems };
  }
});

const sharePayer = () => {
  if (filteredPayerAmounts.value.length === 0) {
    alert($t("messages.noDataShare"));
    return;
  }
  shareUrl.value = "";
  showSharePopup.value = true;
};

const generateShareUrl = async (selectedPayers) => {
  try {
    const allPayersData = filteredPayerAmounts.value
      .filter((payer) => selectedPayers.includes(payer.name))
      .map((payer) => {
        const billItems = [];
        const datesWithStatus = {};

        Object.keys(payer.dates || {}).forEach((date) => {
          const amount = payer.dates[date];
          const isPaid = groupsStore.getPaidStatusByDate(payer.name, date);
          datesWithStatus[date] = {
            amount,
            paid: isPaid,
          };
        });

        groupsStore.activeBills.forEach((bill) => {
          const isPayerInBill = bill.payers.some((p) => p.name === payer.name);
          if (isPayerInBill) {
            const payerInfo = bill.payers.find((p) => p.name === payer.name);
            const serviceChargeRatio = 1 + (bill.serviceCharge || 0) / 100;
            const vatRatio = 1 + (bill.vat || 0) / 100;
            billItems.push({
              description: bill.description,
              amount: applyRounding(
                (bill.amount / bill.payers.length) * serviceChargeRatio * vatRatio,
                groupsStore.roundingMode
              ),
              date: bill.date,
              paid: payerInfo ? payerInfo.paid : false,
            });
          }
        });

        const unpaidAmount = payer.unpaidAmountDue;

        return {
          name: payer.name,
          dates: datesWithStatus,
          paid: payer.paid,
          totalAmountDue: payer.totalAmountDue,
          unpaidAmountDue: unpaidAmount,
          billItems: billItems,
        };
      });

    if (allPayersData.length === 0) {
      alert($t("messages.selectOnePerson"));
      return;
    }

    const promptpayID = groupsStore.activeGroup?.promptpayID || "";

    const sharedData = {
      payers: allPayersData,
      promptpayID: promptpayID,
      locale: locale.value,
    };

    const jsonString = JSON.stringify(sharedData);
    const compressedData = LZString.compressToEncodedURIComponent(jsonString);
    const baseUrl = window.location.origin + window.location.pathname;
    shareUrl.value = `${baseUrl}?payer_info=${compressedData}`;

    await navigator.clipboard.writeText(shareUrl.value).catch((e) => {
      console.error("Could not copy to clipboard:", e);
    });

    await nextTick();
  } catch (error) {
    console.error("Error generating share URL:", error);
    alert($t("messages.errorGenerateLink"));
  }
};

const qrCodeUrl = ref("");

const generateQRCode = async (promptpayInput) => {
  if (!promptpayInput) {
    alert($t("messages.enterPromptpay"));
    return;
  }

  inputPromptpay.value = promptpayInput;
  showQrCode.value = true;
  groupsStore.setGroupPromptpayID(promptpayInput);

  const amount = 0;
  const payload = generatePayload(promptpayInput, { amount });
  const opts = {
    margin: 1,
    width: 200,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  };

  try {
    qrCodeUrl.value = await qrcode.toDataURL(payload, opts);
  } catch (err) {
    console.error("Error generating QR Code: ", err);
  }

  showAddQrCodePopup.value = false;
};

const deleteQRCode = () => {
  groupsStore.setGroupPromptpayID("");
  inputPromptpay.value = "";
  qrCodeUrl.value = "";
  showQrCode.value = false;
};

const togglePaymentStatus = (payer, date) => {
  groupsStore.togglePaidStatus(payer.name, date);
};

const settleAllPaymentStatuses = (payer) => {
  Object.keys(payer.dates).forEach((date) => {
    if (!groupsStore.getPaidStatusByDate(payer.name, date)) {
      groupsStore.togglePaidStatus(payer.name, date);
    }
  });
};

const cancelAllPayments = (payer) => {
  Object.keys(payer.dates).forEach((date) => {
    if (groupsStore.getPaidStatusByDate(payer.name, date)) {
      groupsStore.togglePaidStatus(payer.name, date);
    }
  });
};

const openShareLink = () => {
  if (shareUrl.value) {
    window.open(shareUrl.value, "_blank");
  } else {
    alert($t("messages.linkNotGenerated"));
  }
};

const resetShare = () => {
  shareUrl.value = "";
};

const openPayerDetails = (payer) => {
  selectedPayerName.value = payer.name;
  showPayerDetails.value = true;
};

const closePayerDetails = () => {
  showPayerDetails.value = false;
  selectedPayerName.value = null;
};

const toggleItemStatus = (payerName, itemId) => {
  groupsStore.togglePayerStatus(itemId, payerName);
};

onMounted(() => {
  const groupPromptpayID = groupsStore.activeGroup?.promptpayID || "";
  if (groupPromptpayID) {
    inputPromptpay.value = groupPromptpayID;
    generateQRCode(groupPromptpayID);
  }

  if (typeof groupsStore.cleanUpDatesWithoutBills === "function") {
    groupsStore.cleanUpDatesWithoutBills();
  }
});

watch(
  () => groupsStore.activeBills,
  () => {
    if (typeof groupsStore.cleanUpDatesWithoutBills === "function") {
      groupsStore.cleanUpDatesWithoutBills();
    }
  },
  { deep: true },
);
</script>

<template>
  <div class="pb-12 animate-slide-up">
    <!-- Tools Section -->
    <ToolsSection
      @show-qr-popup="showAddQrCodePopup = true"
      @share-payer="sharePayer"
    />

    <!-- QR Code Display -->
    <QRCodeDisplay
      :show-qr-code="showQrCode"
      :promptpay-id="inputPromptpay"
      :qr-code-url="qrCodeUrl"
    />

    <!-- Payer Amounts List -->
    <div class="space-y-4">
      <PayerCard
        v-for="payer in filteredPayerAmounts"
        :key="payer.name"
        :payer="payer"
        @open-details="() => openPayerDetails(payer)"
      />

      <EmptyState v-if="filteredPayerAmounts.length === 0" />
    </div>

    <!-- Add QR Code Modal -->
    <AddQRCodeModal
      :show="showAddQrCodePopup"
      :promptpayID="inputPromptpay"
      @generate-qr="generateQRCode"
      @delete-qr="deleteQRCode"
      @close="showAddQrCodePopup = false"
    />

    <!-- Share Modal -->
    <ShareModal
      :show="showSharePopup"
      :payer-amounts="filteredPayerAmounts"
      :share-url="shareUrl"
      @generate-share-url="generateShareUrl"
      @open-share-link="openShareLink"
      @reset-share="resetShare"
      @close="showSharePopup = false"
    />

    <!-- Payer Details Modal -->
    <PayerDetailsModal
      :show="showPayerDetails"
      :payer="selectedPayerData"
      @toggle-item="toggleItemStatus"
      @toggle-payment-status="togglePaymentStatus"
      @settle-all="settleAllPaymentStatuses"
      @cancel-all="cancelAllPayments"
      @close="closePayerDetails"
    />

    <!-- Payment QR Code Modal -->
    <PaymentQRModal
      :payer="showQrCodeModalForPayer"
      :promptpayID="
        specificPromptpayID ||
        inputPromptpay ||
        groupsStore.activeGroup?.promptpayID
      "
      :is-visible="!!showQrCodeModalForPayer"
      :amount="specificAmount"
      :title="specificTitle"
      @close="closePaymentModal"
    />
  </div>
</template>
