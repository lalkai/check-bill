<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useBillStore } from "../stores/Bills";
import { usePeopleStore } from "../stores/People";
import generatePayload from "promptpay-qr";
import qrcode from "qrcode";
import html2canvas from "html2canvas-pro";

const billStore = useBillStore();
const peopleStore = usePeopleStore();
const selectedDate = ref(null);

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
    return {
      name,
      dates: filteredDates || {},
      paid: person ? person.paid : false,
      totalAmountDue,
    };
  });
});

const inputPromptpay = ref("");
const showAddQrCodePopup = ref(false);
const showQrCode = ref(false);

const generateQRCode = async () => {
  if (!inputPromptpay.value) {
    alert("โปรดป้อนข้อมูลให้ครบ!");
    return;
  }

  showQrCode.value = true;
  localStorage.setItem("promptpayID", inputPromptpay.value);

  const amount = 0;
  const promptNumber = inputPromptpay.value;
  const payload = generatePayload(promptNumber, { amount });
  const opts = {
    type: "image/png",
    margin: 1,
    width: 120,
  };

  await nextTick();

  const canvas = document.getElementById("qrcode-img");
  if (canvas) {
    qrcode.toCanvas(canvas, payload, opts, (err) => {
      if (err) console.log("Error generating QR Code: ", err);
    });
  } else {
    console.error("Canvas element not found!");
  }

  const promptpayIDElement = document.getElementById("PromptpayID");
  if (promptpayIDElement) {
    promptpayIDElement.textContent = promptNumber;
  } else {
    console.error("PromptpayID element not found!");
  }

  showAddQrCodePopup.value = false;
};

const deleteQRCode = () => {
  localStorage.removeItem("promptpayID");
  inputPromptpay.value = "";

  const canvas = document.getElementById("qrcode-img");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  const promptpayIDElement = document.getElementById("PromptpayID");
  if (promptpayIDElement) {
    promptpayIDElement.textContent = "";
  }

  showQrCode.value = false;
};

const capturePage = async () => {
  try {
    await nextTick();

    const element = document.getElementById("app");

    if (!element) {
      throw new Error('Element with ID "app" not found.');
    }

    const canvas = await html2canvas(element, {
      useCORS: true,
      scale: window.devicePixelRatio,
      logging: true,
      allowTaint: true,
      foreignObjectRendering: true,
      ignoreElements: (element) => {
        return window.getComputedStyle(element).display === "none";
      },
      onclone: (clonedDoc) => {
        Array.from(
          clonedDoc.querySelectorAll(".modal, .dropdown, .tooltip")
        ).forEach((el) => {
          el.style.display = "block";
          el.style.opacity = "1";
          el.style.visibility = "visible";
        });
      },
    });

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "สรุปยอดบิล.png";
          link.click();
          URL.revokeObjectURL(link.href);
        }
      },
      "image/png",
      1.0
    );
  } catch (error) {
    console.error("Error capturing page:", error);
  }
};

onMounted(() => {
  const storedPromptpayID = localStorage.getItem("promptpayID");
  if (storedPromptpayID) {
    inputPromptpay.value = storedPromptpayID;
    generateQRCode();
  }
});

const togglePaymentStatus = (payer, date) => {
  peopleStore.togglePaidStatus(payer.name, date);
};
</script>

<template>
  <div class="container mx-auto mt-4">
    <div class="card bg-base-100  p-4">
      <div class="flex justify-center space-x-2">
    <button @click="showAddQrCodePopup = true" class="btn btn-black">
      ใส่พร้อมเพย์
    </button>
    <button @click="deleteQRCode" class="btn btn-black">
      ลบ QR Code
    </button>
    <button @click="capturePage" class="btn btn-black">
      ดาวน์โหลด
    </button>
  </div>
    </div>
    
    <div v-if="showQrCode" class="card bg-base-100 p-6 mt-4">
      <h3 class="text-2xl font-semibold mb-4 text-center">PromptPay QR Code</h3>
      <div class="flex justify-center mb-4">
        <canvas
          id="qrcode-img"
          class="border-4 border-primary rounded-lg"
        ></canvas>
      </div>
      <p class="text-center text-gray-700">
        PromptPay ID: <span id="PromptpayID" class="font-medium"></span>
      </p>
    </div>

  <div class="grid gap-4 mt-4">
  <div
    v-for="(payer, index) in filteredPayerAmounts"
    :key="index"
    :class="
      payer.paid
        ? 'bg-success text-success-content'
        : 'bg-error text-error-content'
    "
    class="card transition-all duration-300"
  >
    <div class="card-body">
      <h2 class="card-title">
        {{ payer.name }}
        <div class="badge badge-lg">
          {{ payer.paid ? "จ่ายครบแล้ว" : "ยังจ่ายไม่ครบ" }}
        </div>
      </h2>
      <p class="text-lg">
        ยอดรวม: {{ payer.totalAmountDue.toFixed(2) }} บาท
      </p>
      <ul class="space-y-2">
        <li
          v-for="(amount, date) in payer.dates"
          :key="date"
          class="flex justify-between items-center bg-white text-black p-2 rounded-md"
        >
          <span class="font-medium">{{ date }}</span>
          <span>{{ amount ? amount.toFixed(2) : "0.00" }} บาท</span>
          <button
            @click="togglePaymentStatus(payer, date)"
            :class="
              peopleStore.getPaidStatusByDate(payer.name, date)
                ? 'btn-success text-center'
                : 'btn-error text-center'
            "
            class="btn btn-sm"
          >
            {{
              peopleStore.getPaidStatusByDate(payer.name, date)
                ? "จ่ายแล้ว"
                : "ยังไม่จ่าย"
            }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</div>


    <div
      v-if="showAddQrCodePopup"
      class="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50"
    >
      <div class="bg-base-100 p-6 rounded-lg shadow-lg w-96">
        <h2 class="text-2xl font-semibold mb-4">เพิ่ม PromptPay QR Code</h2>
        <input
          v-model="inputPromptpay"
          type="text"
          placeholder="PromptPay ID"
          class="input input-bordered w-full mb-4"
        />
        <div class="flex justify-end space-x-2">
          <button @click="generateQRCode" class="btn btn-primary">
            สร้าง QR Code
          </button>
          <button @click="showAddQrCodePopup = false" class="btn btn-outline">
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>


.btn-black {
  background-color: black;
  color: white;
}

@media (max-width: 768px) {
  .btn {
    font-size: 12px;
  }
}
</style>