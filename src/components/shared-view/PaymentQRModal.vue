<script setup>
import { nextTick, watch, computed } from "vue";
import { useScrollLock } from "../../composables/useScrollLock";
import { useI18n } from "vue-i18n";
import generatePayload from "promptpay-qr";
import qrcode from "qrcode";
import { useBillGroupsStore } from "../../stores/BillGroups";
import { hexToRgb } from "../../utils/theme";
import CloseButton from "../common/CloseButton.vue";

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
      `payment-qrcode-container-${props.payer.name.replace(/\s+/g, "-")}`,
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
          "shared.errorGenerateQR",
        )}</p>`;
        return;
      }
      qrContainer.appendChild(canvas);

      const amountText = document.createElement("div");
      amountText.className =
        "text-center mt-6 text-3xl font-black text-neutral-800 dark:text-white tracking-tight";
      amountText.innerHTML = `<span class="text-xl opacity-60 mr-1">฿</span>${amount.toLocaleString()}`;
      qrContainer.appendChild(amountText);

      const promptpayInfoText = document.createElement("div");
      promptpayInfoText.className =
        "mt-4 inline-flex items-center justify-center bg-neutral-100 dark:bg-neutral-600 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-500 mx-auto text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-300 gap-2";
      promptpayInfoText.innerHTML = `<span>ID</span><span class="text-neutral-700 dark:text-white">${props.promptpayID}</span>`;
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
  },
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
        class="fixed inset-0 flex items-end justify-center z-50 transition-all p-3 sm:p-4 sm:items-center"
      >
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-sm"
          @click="closeModal"
        ></div>
        <div
          class="relative bg-white dark:bg-neutral-800 rounded-[2.2rem] sm:rounded-[2.5rem] shadow-[0_24px_60px_rgba(0,0,0,0.18)] w-full max-w-sm border border-white/20 dark:border-neutral-700/50 max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
        >
          <!-- Header -->
          <div
            class="px-8 pt-8 pb-5 flex justify-between items-start border-b border-neutral-100 dark:border-neutral-700/50 flex-shrink-0"
          >
            <div>
              <h2
                class="text-2xl font-black text-neutral-800 dark:text-white tracking-tight"
              >
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
            <CloseButton @click="closeModal" />
          </div>

          <!-- Scrollable Body -->
          <div
            data-scroll-inner
            class="flex-1 overflow-y-auto scrollbar-hide px-8 py-6 flex flex-col justify-center items-center"
          >
            <div
              :id="`payment-qrcode-container-${payer.name.replace(/\s+/g, '-')}`"
              class="bg-white dark:bg-neutral-700 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-600 shadow-sm w-full min-h-[300px] flex flex-col justify-center text-center items-center"
              v-motion
              :initial="{ opacity: 0 }"
              :enter="{
                opacity: 1,
                transition: { duration: 200, ease: 'easeOut' },
              }"
            ></div>
          </div>

          <!-- Sticky Footer -->
          <div
            class="px-8 py-5 border-t border-neutral-100 dark:border-neutral-700/50 bg-white dark:bg-neutral-800 flex-shrink-0"
          >
            <button
              @click="closeModal"
              class="w-full text-white font-black text-[12px] uppercase tracking-widest py-4 px-6 rounded-2xl transition-all active:scale-95 shadow-lg cursor-pointer"
              :style="{
                backgroundColor: groupColor,
                boxShadow: `0 4px 14px rgba(${groupColorRgb.r}, ${groupColorRgb.g}, ${groupColorRgb.b}, 0.3)`,
              }"
            >
              {{ $t("actions.done") }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
