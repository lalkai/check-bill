<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import { useBillStore } from "../stores/Bills";
import { usePeopleStore } from "../stores/People";
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

const billStore = useBillStore();
const peopleStore = usePeopleStore();
const selectedDate = ref(null);

const inputPromptpay = ref("");
const showQrCode = ref(false);

const showAddQrCodePopup = ref(false);
const showSharePopup = ref(false);
const showPayerDetails = ref(false);
const selectedPayer = ref(null);

const shareUrl = ref("");

const filteredPayerAmounts = computed(() => {
  const amounts = billStore.payerAmounts;
  const peopleList = peopleStore.list;

  return Object.entries(amounts).map(([name, dates]) => {
    const person = peopleList.find((person) => person.name === name);
    const filteredDates = selectedDate.value
      ? { [selectedDate.value]: dates[selectedDate.value] || 0 }
      : dates;

    const totalAmountDue = Object.values(filteredDates).reduce(
      (acc, amount) => acc + amount,
      0
    );

    const unpaidAmountDue = Object.entries(filteredDates).reduce(
      (total, [date, amount]) => {
        if (!peopleStore.getPaidStatusByDate(name, date)) {
          return total + amount;
        }
        return total;
      },
      0
    );

    const isPaid = totalAmountDue > 0 ? unpaidAmountDue === 0 : false;

    return {
      name,
      dates: filteredDates || {},
      paid: isPaid,
      totalAmountDue,
      unpaidAmountDue,
    };
  });
});

const sharePayer = () => {
  if (filteredPayerAmounts.value.length === 0) {
    alert("ไม่มีข้อมูลให้แชร์");
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
          const isPaid = peopleStore.getPaidStatusByDate(payer.name, date);
          datesWithStatus[date] = {
            amount,
            paid: isPaid,
          };
        });

        billStore.bills.forEach((bill) => {
          const isPayerInBill = bill.payers.some((p) => p.name === payer.name);
          if (isPayerInBill) {
            billItems.push({
              description: bill.description,
              amount: bill.amount / bill.payers.length,
              date: bill.date,
              paid: peopleStore.getPaidStatusByDate(payer.name, bill.date),
            });
          }
        });

        const unpaidAmount = Object.keys(payer.dates || {}).reduce(
          (total, date) => {
            if (!peopleStore.getPaidStatusByDate(payer.name, date)) {
              return total + payer.dates[date];
            }
            return total;
          },
          0
        );

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
      alert("โปรดเลือกอย่างน้อยหนึ่งคนเพื่อแชร์");
      return;
    }

    const promptpayID = localStorage.getItem("promptpayID");

    const sharedData = {
      payers: allPayersData,
      promptpayID: promptpayID || "",
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
    alert("เกิดข้อผิดพลาดในการสร้าง URL สำหรับแชร์");
  }
};

const generateQRCode = async (promptpayInput) => {
  if (!promptpayInput) {
    alert("โปรดป้อนข้อมูลให้ครบ!");
    return;
  }

  inputPromptpay.value = promptpayInput;
  showQrCode.value = true;
  localStorage.setItem("promptpayID", promptpayInput);

  const amount = 0;
  const payload = generatePayload(promptpayInput, { amount });
  const opts = {
    type: "image/png",
    margin: 1,
    width: 180,
  };

  await nextTick();

  const canvas = document.createElement("canvas");
  qrcode.toCanvas(canvas, payload, opts, (err) => {
    if (err) console.log("Error generating QR Code: ", err);
    const canvasContainer = document.getElementById("qrcode-img-container");
    if (canvasContainer) {
      canvas.id = "qrcode-img";
      canvas.className = "rounded-2xl";
      canvasContainer.innerHTML = "";
      canvasContainer.appendChild(canvas);
    } else {
      console.error("Canvas container element not found!");
    }
  });

  const promptpayIDElement = document.getElementById("PromptpayID");
  if (promptpayIDElement) {
    promptpayIDElement.textContent = promptpayInput;
  } else {
    console.error("PromptpayID element not found!");
  }

  showAddQrCodePopup.value = false;
};

const deleteQRCode = () => {
  localStorage.removeItem("promptpayID");
  inputPromptpay.value = "";

  const img = document.getElementById("qrcode-img-img");
  if (img) {
    img.remove();
  }

  const canvasContainer = document.getElementById("qrcode-img-container");
  if (canvasContainer) {
    canvasContainer.innerHTML =
      '<canvas id="qrcode-img" class="rounded-2xl"></canvas>';
  }

  const promptpayIDElement = document.getElementById("PromptpayID");
  if (promptpayIDElement) {
    promptpayIDElement.textContent = "";
  }

  showQrCode.value = false;
};

const togglePaymentStatus = (payer, date) => {
  peopleStore.togglePaidStatus(payer.name, date);
};

const openShareLink = () => {
  if (shareUrl.value) {
    window.open(shareUrl.value, "_blank");
  } else {
    alert("ยังไม่ได้สร้างลิงก์สำหรับแชร์");
  }
};

const resetShare = () => {
  shareUrl.value = "";
};

const openPayerDetails = (payer) => {
  const billItems = billStore.bills
    .filter((bill) => bill.payers.some((p) => p.name === payer.name))
    .map((bill) => ({
      description: bill.description,
      amount: bill.amount / bill.payers.length,
      date: bill.date,
      paid: peopleStore.getPaidStatusByDate(payer.name, bill.date),
    }));
  
  selectedPayer.value = { ...payer, billItems };
  showPayerDetails.value = true;
};

const closePayerDetails = () => {
  showPayerDetails.value = false;
  selectedPayer.value = null;
};

onMounted(() => {
  const storedPromptpayID = localStorage.getItem("promptpayID");
  if (storedPromptpayID) {
    inputPromptpay.value = storedPromptpayID;
    generateQRCode(storedPromptpayID);
  }

  if (typeof peopleStore.cleanUpDatesWithoutBills === "function") {
    peopleStore.cleanUpDatesWithoutBills({ bills: billStore.bills });
  }
});

watch(
  () => billStore.bills,
  () => {
    if (typeof peopleStore.cleanUpDatesWithoutBills === "function") {
      peopleStore.cleanUpDatesWithoutBills({ bills: billStore.bills });
    }
  },
  { deep: true }
);
</script>

<template>
  <div>
    <!-- Tools Section -->
    <ToolsSection @show-qr-popup="showAddQrCodePopup = true" @delete-qr="deleteQRCode" @share-payer="sharePayer" />

    <!-- QR Code Display -->
    <QRCodeDisplay :show-qr-code="showQrCode" :promptpay-id="inputPromptpay" />

    <!-- Payer Amounts List -->
    <div class="space-y-4">
      <PayerCard v-for="(payer, index) in filteredPayerAmounts" :key="index" :payer="payer"
        @toggle-payment-status="togglePaymentStatus" @open-details="() => openPayerDetails(payer)" />

      <EmptyState v-if="filteredPayerAmounts.length === 0" />
    </div>

    <!-- Add QR Code Modal -->
    <AddQRCodeModal :show="showAddQrCodePopup" @generate-qr="generateQRCode" @close="showAddQrCodePopup = false" />

    <!-- Share Modal -->
    <ShareModal :show="showSharePopup" :payer-amounts="filteredPayerAmounts" :share-url="shareUrl"
      @generate-share-url="generateShareUrl" @open-share-link="openShareLink" @reset-share="resetShare"
      @close="showSharePopup = false" />

    <!-- Payer Details Modal -->
    <PayerDetailsModal :show="showPayerDetails" :payer="selectedPayer" @close="closePayerDetails" />
  </div>
</template>
