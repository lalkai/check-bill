<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useBillStore } from "../stores/Bills";
import { usePeopleStore } from "../stores/People";
import generatePayload from "promptpay-qr";
import qrcode from "qrcode";

const billStore = useBillStore();
const peopleStore = usePeopleStore();

const payerAmounts = computed(() => {
  const amounts = billStore.payerAmounts;
  const peopleList = peopleStore.list;

  return Object.entries(amounts).map(([name, amount]) => {
    const person = peopleList.find((person) => person.name === name);
    return {
      name,
      amount: amount || 0,
      paid: person ? person.paid : false,
    };
  });
});

const inputPromptpay = ref("");
const showPopup = ref(false);
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
      if (err) console.log("Error: ", err);
    });
  } else {
    console.error("Canvas element not found!");
  }

  const promptpayIDElement = document.getElementById("PromptpayID");
  if (promptpayIDElement) {
    promptpayIDElement.innerHTML = promptNumber;
  } else {
    console.error("PromptpayID element not found!");
  }

  showPopup.value = false;
};

const cancelQRCode = () => {
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
    promptpayIDElement.innerHTML = "";
  }

  showQrCode.value = false;
};

onMounted(() => {
  const storedPromptpayID = localStorage.getItem("promptpayID");
  if (storedPromptpayID) {
    inputPromptpay.value = storedPromptpayID;
    generateQRCode();
  }
});
</script>

<template>
  <div class="mt-8">
    <div v-if="showQrCode" class="flex justify-center mt-8">
      <div class="bg-base-100 p-6 rounded-lg shadow-lg text-center">
        <h3 class="text-xl font-semibold mb-4">PromptPay QR Code</h3>
        <div class="mb-4">
          <canvas id="qrcode-img" class="mx-auto"></canvas>
        </div>
        <p class="text-sm text-gray-600">
          PromptPay ID: <span id="PromptpayID" class="font-medium"></span>
        </p>
      </div>
    </div>

    <div class="flex justify-center mt-6 space-x-4">
      <button @click="showPopup = true" class="btn btn-outline btn-info">
        ใส่พร้อมเพย์
      </button>
      <button @click="cancelQRCode" class="btn btn-outline btn-danger">
        ยกเลิก QR Code
      </button>
    </div>

    <ul class="space-y-2 mt-4">
      <li
        v-for="(payer, index) in payerAmounts"
        :key="index"
        :class="payer.paid ? 'bg-success' : 'bg-error'"
        class="p-4 mb-2 text-white rounded-lg shadow-lg flex justify-between items-center"
      >
        <span
          >{{ payer.name }} ({{ payer.paid ? "จ่ายแล้ว" : "ยังไม่จ่าย" }})</span
        >
        <span>{{ payer.amount ? payer.amount.toFixed(2) : "0.00" }} บาท</span>
      </li>
    </ul>

    <div
      v-if="showPopup"
      class="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75"
    >
      <div class="bg-base-100 p-4 rounded-lg shadow-lg w-96">
        <div class="flex justify-end">
          <button @click="showPopup = false" class="text-gray-500">
            &times;
          </button>
        </div>
        <div class="mt-4">
          <input
            v-model="inputPromptpay"
            type="text"
            placeholder="PromptPay ID"
            class="input input-bordered w-full mb-4"
          />
          <button
            @click="generateQRCode"
            class="btn btn-outline btn-info w-full"
          >
            Generate QR Code
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
