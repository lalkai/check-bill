<script setup>
import { nextTick, watch, computed } from "vue";
import { useScrollLock } from "../../composables/useScrollLock";
import { useI18n } from "vue-i18n";
import generatePayload from "promptpay-qr";
import qrcode from "qrcode";
import { useBillGroupsStore } from "../../stores/BillGroups";
import { hexToRgb } from "../../utils/theme";

const props = defineProps({
  payer: {
    type: Object,
    default: null,
  },
  promptpayID: {
    type: String,
    required: true,
  },
  isVisible: {
    type: Boolean,
    default: false,
  },
  amount: {
    type: Number,
    default: null,
  },
  title: {
    type: String,
    default: "",
  },
});
useScrollLock(computed(() => props.isVisible));

const emit = defineEmits(["close"]);
const { t: $t } = useI18n();
const groupsStore = useBillGroupsStore();

const groupColor = computed(() => groupsStore.activeGroup?.color || "#0066cc");
const groupColorRgb = computed(() => hexToRgb(groupColor.value));

const generatePaymentQRCode = async () => {
  if (!props.promptpayID) {
    alert($t("shared.errorGenerateQR"));
    return;
  }

  let unpaidAmount = props.amount;
  if (unpaidAmount === null || unpaidAmount === undefined) {
    if (!props.payer) {
      alert($t("shared.errorGenerateQR"));
      return;
    }
    if (props.payer.paid) {
      alert($t("shared.alreadySettled"));
      emit("close");
      return;
    }
    unpaidAmount =
      typeof props.payer.unpaidAmountDue === "number"
        ? props.payer.unpaidAmountDue
        : props.payer.totalAmountDue;
  }

  if (unpaidAmount <= 0) {
    alert($t("shared.noBalance"));
    emit("close");
    return;
  }

  try {
    const amount = unpaidAmount;
    const payload = generatePayload(props.promptpayID, { amount });
    const opts = {
      type: "image/png",
      margin: 1,
      width: 220,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    };

    const qrContainer = document.getElementById(
      `payment-qrcode-container-${props.payer.name.replace(/\s+/g, "-")}`
    );
    if (!qrContainer) {
      console.error("QR Code container not found for payer:", props.payer.name);
      return;
    }

    qrContainer.innerHTML = "";

    const canvas = document.createElement("canvas");
    canvas.className = "rounded-2xl mx-auto shadow-sm";

    qrcode.toCanvas(canvas, payload, opts, (err) => {
      if (err) {
        console.error("Error generating payment QR Code:", err);
        qrContainer.innerHTML = `<p class="text-red-500 font-bold text-center">${$t(
          "shared.errorGenerateQR"
        )}</p>`;
        return;
      }
      qrContainer.appendChild(canvas);

      const amountText = document.createElement("div");
      amountText.className =
        "text-center mt-6 text-3xl font-black text-neutral-800 tracking-tight";
      amountText.innerHTML = `<span class="text-xl opacity-60 mr-1">฿</span>${amount.toLocaleString()}`;
      qrContainer.appendChild(amountText);

      const promptpayInfoText = document.createElement("div");
      promptpayInfoText.className =
        "mt-4 inline-flex items-center justify-center bg-neutral-100 px-4 py-2 rounded-xl border border-neutral-200 mx-auto text-[10px] font-black uppercase tracking-widest text-neutral-500 gap-2";
      promptpayInfoText.innerHTML = `<span>ID</span><span class="text-neutral-700">${props.promptpayID}</span>`;
      qrContainer.appendChild(promptpayInfoText);
    });
  } catch (error) {
    console.error("Error in generatePaymentQRCode:", error);
    alert($t("shared.errorGenerateQR"));
  }
};

watch(
  () => props.isVisible,
  (newValue) => {
    if (newValue && props.payer) {
      nextTick(() => {
        generatePaymentQRCode();
      });
    }
  }
);

const closeModal = () => {
  emit("close");
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isVisible && payer"
        class="fixed inset-0 flex items-center justify-center z-50 transition-all p-4"
      >
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-sm"
          @click="closeModal"
        ></div>
        <div
          class="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-sm p-8 m-4 relative z-10 border border-white/20"
        >
          <div class="flex justify-between items-start mb-6">
            <div>
              <h2 class="text-2xl font-black text-neutral-800 tracking-tight">
                {{ title || $t("shared.scanToPay") }}
              </h2>
              <p
                class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1"
              >
                {{
                  $t("shared.forUser", {
                    name: payer.name,
                  })
                }}
              </p>
            </div>
          </div>

          <div
            :id="`payment-qrcode-container-${payer.name.replace(/\s+/g, '-')}`"
            class="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm min-h-[300px] flex flex-col justify-center text-center"
          ></div>

          <button
            @click="closeModal"
            class="w-full mt-6 text-white font-black text-[12px] uppercase tracking-widest py-4 px-6 rounded-2xl transition-all active:scale-95 shadow-lg"
            :style="{
              backgroundColor: groupColor,
              boxShadow: `0 4px 14px rgba(${groupColorRgb.r}, ${groupColorRgb.g}, ${groupColorRgb.b}, 0.3)`
            }"
          >
            {{ $t("actions.done") }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
