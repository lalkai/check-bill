<script setup>
import { ref, watch, computed, nextTick } from "vue";
import { useScrollLock } from "../../composables/useScrollLock";
import { useI18n } from "vue-i18n";
import { useClipboard } from "@vueuse/core";
import qrcode from "qrcode";
import CloseButton from "../common/CloseButton.vue";

const { t: $t } = useI18n();
import { formatCurrency } from "../../utils/common";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  payerAmounts: {
    type: Array,
    default: () => [],
  },
  shareUrl: {
    type: String,
    default: "",
  },
});
useScrollLock(computed(() => props.show));
const { copy, copied } = useClipboard({
  source: computed(() => props.shareUrl),
});

const emit = defineEmits([
  "close",
  "generate-share-url",
  "open-share-link",
  "reset-share",
]);

const selectedPayers = ref([]);
const selectAllPayers = ref(true);

watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      selectedPayers.value = props.payerAmounts
        .filter((p) => !p.isOwner)
        .map((payer) => payer.name);
      selectAllPayers.value = true;
    }
  },
);

watch(
  () => props.shareUrl,
  async (newValue) => {
    if (newValue && props.show) {
      await nextTick();
      generateShareQRCode(newValue);
    }
  },
);

const toggleSelectAllPayers = () => {
  if (selectAllPayers.value) {
    selectedPayers.value = props.payerAmounts
      .filter((p) => !p.isOwner)
      .map((payer) => payer.name);
  } else {
    selectedPayers.value = [];
  }
};

const togglePayerSelection = (payerName) => {
  const index = selectedPayers.value.indexOf(payerName);
  if (index === -1) {
    selectedPayers.value.push(payerName);
  } else {
    selectedPayers.value.splice(index, 1);
  }
  const nonOwnersCount = props.payerAmounts.filter((p) => !p.isOwner).length;
  selectAllPayers.value = selectedPayers.value.length === nonOwnersCount;
  selectedPayers.value = [...selectedPayers.value];
};

const generateShareQRCode = (url) => {
  const shareQrCodeContainer = document.getElementById("share-qrcode");
  if (!shareQrCodeContainer) return;

  while (shareQrCodeContainer.firstChild) {
    shareQrCodeContainer.removeChild(shareQrCodeContainer.firstChild);
  }

  const canvas = document.createElement("canvas");
  shareQrCodeContainer.appendChild(canvas);

  const opts = {
    errorCorrectionLevel: "M",
    type: "image/png",
    margin: 1,
    width: 200,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  };

  qrcode.toCanvas(canvas, url, opts, (err) => {
    if (err) console.error("Error generating share QR Code:", err);
  });
};

const handleGenerateShareUrl = () => {
  emit("generate-share-url", selectedPayers.value);
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-end justify-center p-3 sm:p-4 sm:items-center"
      >
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          @click="emit('close')"
        ></div>

        <!-- Modal -->
        <div
          class="relative bg-white rounded-[2.2rem] sm:rounded-[2.5rem] shadow-[0_24px_60px_rgba(0,0,0,0.18)] w-full max-w-md border border-white/20 max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
        >
          <!-- Header -->
          <div
            class="px-8 pt-8 pb-5 flex justify-between items-center border-b border-neutral-100 flex-shrink-0"
          >
            <h2 class="text-2xl font-black text-neutral-800 tracking-tight">
              {{ $t("share.title") }}
            </h2>
            <CloseButton @click="emit('close')" />
          </div>

          <!-- Scrollable Body -->
          <div
            data-scroll-inner
            class="flex-1 overflow-y-auto scrollbar-hide px-8 py-6 space-y-6"
          >
            <!-- Payer Selection -->
            <div v-if="!shareUrl">
              <div class="flex items-center justify-between mb-4">
                <label
                  class="block text-[11px] font-black text-neutral-400 uppercase tracking-widest"
                  >{{ $t("share.selectPeople") }}</label
                >
                <div
                  class="flex items-center cursor-pointer"
                  @click="
                    selectAllPayers = !selectAllPayers;
                    toggleSelectAllPayers();
                  "
                >
                  <div
                    class="w-4 h-4 rounded border-2 mr-2 flex items-center justify-center transition-colors"
                    :class="
                      selectAllPayers
                        ? 'bg-primary border-primary'
                        : 'border-neutral-300'
                    "
                  >
                    <svg
                      v-if="selectAllPayers"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      class="w-3 h-3 text-white"
                      :stroke-width="3"
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m5 12 5 5L20 7"
                      ></path>
                    </svg>
                  </div>
                  <span
                    class="text-[10px] font-bold text-neutral-500 uppercase tracking-widest"
                    >{{ $t("share.all") }}</span
                  >
                </div>
              </div>

              <div class="space-y-2">
                <div
                  v-for="payer in payerAmounts.filter((p) => !p.isOwner)"
                  :key="payer.name"
                  class="flex items-center p-3 border-2 rounded-xl transition-all cursor-pointer"
                  :class="
                    selectedPayers.includes(payer.name)
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-neutral-100 hover:border-neutral-200 bg-white'
                  "
                  @click="togglePayerSelection(payer.name)"
                >
                  <div
                    class="w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-colors"
                    :class="
                      selectedPayers.includes(payer.name)
                        ? 'bg-primary border-primary'
                        : 'border-neutral-300'
                    "
                  >
                    <svg
                      v-if="selectedPayers.includes(payer.name)"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      class="w-3.5 h-3.5 text-white"
                      :stroke-width="3"
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m5 12 5 5L20 7"
                      ></path>
                    </svg>
                  </div>
                  <div class="flex-1 flex justify-between items-center">
                    <span class="text-sm font-black text-neutral-700">{{
                      payer.name
                    }}</span>
                    <span
                      class="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg"
                      :class="
                        payer.unpaidAmountDue > 0
                          ? 'bg-orange-50 text-orange-500'
                          : 'bg-green-50 text-green-500'
                      "
                    >
                      {{
                        payer.unpaidAmountDue > 0
                          ? `฿${formatCurrency(payer.unpaidAmountDue)}`
                          : $t("summary.settled")
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Share URL -->
            <div v-if="shareUrl">
              <label
                class="block text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-3"
              >
                {{ $t("share.link", { count: selectedPayers.length }) }}
              </label>
              <div
                class="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 mb-6 flex items-center"
              >
                <input
                  type="text"
                  readonly
                  :value="shareUrl"
                  class="bg-transparent w-full outline-none text-xs font-mono text-neutral-600"
                />
                <button
                  class="ml-2 font-bold text-[10px] uppercase tracking-widest shrink-0 cursor-pointer transition-colors"
                  :class="copied ? 'text-green-500' : 'text-primary'"
                  @click="copy()"
                >
                  {{ copied ? $t("share.copied") : $t("share.copy") }}
                </button>
              </div>

              <!-- Share QR Code -->
              <div
                class="flex flex-col items-center justify-center bg-white border-2 border-neutral-100 rounded-3xl p-6 shadow-sm"
                v-motion
                :initial="{ opacity: 0 }"
                :enter="{
                  opacity: 1,
                  transition: { duration: 200, ease: 'easeOut' },
                }"
              >
                <h3
                  class="text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-4"
                >
                  {{ $t("share.scanToOpen") }}
                </h3>
                <div id="share-qrcode" class="rounded-xl overflow-hidden"></div>
              </div>
            </div>
          </div>

          <!-- Sticky Footer -->
          <div
            v-if="!shareUrl"
            class="px-8 py-5 border-t border-neutral-100 bg-white flex-shrink-0"
          >
            <button
              @click="handleGenerateShareUrl"
              :disabled="selectedPayers.length === 0"
              class="w-full bg-neutral-800 text-white font-black text-[12px] uppercase tracking-widest py-4 px-6 rounded-2xl hover:bg-neutral-900 transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {{ $t("share.generate") }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
