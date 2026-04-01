<script setup>
import { ref, watch, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useBillStore } from "../../stores/Bills";
import { recognizeReceipt, terminateWorker } from "../../utils/ocrEngine.js";
import { preventNonNumberInput, formatCurrency } from "../../utils/common";
import { HugeiconsIcon } from "@hugeicons/vue";
import {
  Cancel01Icon,
  CloudUploadIcon,
  Tick01Icon,
  Delete02Icon,
  RefreshIcon,
  Add01Icon,
} from "@hugeicons/core-free-icons";

const billStore = useBillStore();
const { t: $t } = useI18n();

const emit = defineEmits(["close"]);

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});

const receiptImageFile = ref(null);
const ocrProcessing = ref(false);
const ocrError = ref("");
const extractedItems = ref([]);
const successMessage = ref("");
const previewUrl = ref("");
const ocrStep = ref(1);
const isDragOver = ref(false);
const downloadProgress = ref(0);
const statusMessage = ref("");
const rawOcrText = ref("");
const showRawText = ref(false);
const ocrConfidence = ref(0);

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      resetOcrForm();
    }
  }
);

onUnmounted(() => {
  terminateWorker();
});

function closeOcrModal() {
  emit("close");
}

function handleImageUpload(event) {
  ocrError.value = "";
  successMessage.value = "";
  extractedItems.value = [];
  const file = event.target?.files?.[0] || event.dataTransfer?.files?.[0];

  if (!file) {
    receiptImageFile.value = null;
    previewUrl.value = "";
    ocrStep.value = 1;
    return;
  }

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const maxFileSize = 10 * 1024 * 1024;

  if (!allowedTypes.includes(file.type.toLowerCase())) {
    ocrError.value = $t("ocr.invalidImage");
    return;
  }

  if (file.size > maxFileSize) {
    ocrError.value = $t("ocr.tooLarge");
    return;
  }

  receiptImageFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
  ocrStep.value = 1;
}

function handleDrop(event) {
  event.preventDefault();
  isDragOver.value = false;
  handleImageUpload(event);
}

function handleDragOver(event) {
  event.preventDefault();
  isDragOver.value = true;
}

function handleDragLeave(event) {
  event.preventDefault();
  isDragOver.value = false;
}

async function processReceiptImage() {
  if (!receiptImageFile.value) {
    ocrError.value = $t("ocr.selectReceipt");
    return;
  }

  ocrStep.value = 2;
  ocrProcessing.value = true;
  ocrError.value = "";
  successMessage.value = "";
  extractedItems.value = [];
  rawOcrText.value = "";
  ocrConfidence.value = 0;

  try {
    const result = await recognizeReceipt(
      receiptImageFile.value,
      (progress) => {
        statusMessage.value = progress.status;
        downloadProgress.value = progress.progress;
      }
    );

    rawOcrText.value = result.text;
    ocrConfidence.value = Math.round(result.confidence);

    if (result.items.length === 0) {
      if (result.text && result.text.trim()) {
        const lines = result.text.split(/\r?\n/).filter((l) => l.trim());
        extractedItems.value = lines.map((line) => ({
          description: line.trim(),
          amount: 0,
          selected: false,
        }));
        ocrStep.value = 3;
        ocrError.value = $t("ocr.noPrices");
      } else {
        ocrError.value = $t("ocr.noText");
        ocrStep.value = 1;
      }
    } else {
      extractedItems.value = result.items;
      ocrStep.value = 3;
      const validItemsCount = extractedItems.value.filter(
        (item) => item.amount > 0
      ).length;
      successMessage.value = $t("ocr.foundItems", {
        count: extractedItems.value.length,
        valid: validItemsCount,
        confidence: ocrConfidence.value,
      });
    }
  } catch (error) {
    console.error("Error processing receipt image:", error);
    ocrError.value = error.message || $t("ocr.processError");
    ocrStep.value = 1;
  } finally {
    ocrProcessing.value = false;
  }
}

function addSelectedItemsToBills() {
  const itemsToAdd = extractedItems.value.filter(
    (item) => item.selected && item.description.trim() && item.amount > 0
  );
  if (itemsToAdd.length === 0) {
    ocrError.value = $t("ocr.selectItems");
    return;
  }
  try {
    itemsToAdd.forEach((item) => {
      const cleanDescription = String(item.description)
        .trim()
        .slice(0, 255)
        .replace(/[<>\"'&]/g, "");

      const cleanAmount = Number(item.amount) || 0;

      if (cleanAmount < 0 || cleanAmount > 999999.99) {
        throw new Error(`Invalid amount: ${cleanAmount}`);
      }

      const cleanDate = new Date().toISOString().split("T")[0];

      if (!cleanDescription || cleanDescription.length < 1) {
        throw new Error($t("ocr.itemNoDescription"));
      }

      billStore.addBill(cleanDescription, cleanAmount, cleanDate);
    });

    successMessage.value = $t("ocr.addSuccess", { count: itemsToAdd.length });

    setTimeout(() => {
      closeOcrModal();
    }, 1500);
  } catch (error) {
    console.error("Error adding OCR bills:", error);
    ocrError.value = error.message || $t("ocr.addError");
  }
}

function removeOcrItem(index) {
  extractedItems.value.splice(index, 1);
  if (extractedItems.value.length === 0) {
    ocrStep.value = 1;
  }
}

function resetOcrForm() {
  extractedItems.value = [];
  receiptImageFile.value = null;
  previewUrl.value = "";
  ocrError.value = "";
  successMessage.value = "";
  ocrStep.value = 1;
  isDragOver.value = false;
  rawOcrText.value = "";
  showRawText.value = false;
  ocrConfidence.value = 0;
  const fileInput = document.getElementById("bill-image-ocr");
  if (fileInput) fileInput.value = "";
}

function startOcrOver() {
  resetOcrForm();
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        @click="closeOcrModal"
      ></div>

      <!-- Modal panel -->
      <div
        class="relative bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full p-8 animate-modalIn border border-white/20 max-h-[90vh] overflow-y-auto"
        :class="ocrStep === 3 ? 'max-w-2xl' : 'max-w-md'"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-black text-neutral-800 tracking-tight">
            {{ $t("ocr.title") }}
          </h2>
          <button
            @click="closeOcrModal"
            class="p-2 rounded-xl hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors flex items-center justify-center"
          >
            <HugeiconsIcon :icon="Cancel01Icon" size="20" stroke-width="2.5" />
          </button>
        </div>

        <!-- Progress Steps -->
        <div class="mb-8">
          <div class="flex items-center justify-center space-x-2 sm:space-x-4">
            <div class="flex items-center">
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full text-xs font-black transition-all shadow-sm"
                :class="
                  ocrStep >= 1
                    ? 'bg-primary text-white ring-2 ring-primary/20 ring-offset-2'
                    : 'bg-neutral-100 text-neutral-400'
                "
              >
                1
              </div>
              <span
                class="ml-2 text-[10px] font-black uppercase tracking-widest hidden sm:block"
                :class="ocrStep >= 1 ? 'text-primary' : 'text-neutral-400'"
              >
                {{ $t("ocr.upload") }}
              </span>
            </div>

            <div
              class="flex-1 h-1 mx-2 rounded-full"
              :class="ocrStep >= 2 ? 'bg-primary/30' : 'bg-neutral-100'"
            ></div>

            <div class="flex items-center">
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full text-xs font-black transition-all shadow-sm"
                :class="
                  ocrStep >= 2
                    ? 'bg-primary text-white ring-2 ring-primary/20 ring-offset-2'
                    : 'bg-neutral-100 text-neutral-400'
                "
              >
                2
              </div>
              <span
                class="ml-2 text-[10px] font-black uppercase tracking-widest hidden sm:block"
                :class="ocrStep >= 2 ? 'text-primary' : 'text-neutral-400'"
              >
                {{ $t("ocr.process") }}
              </span>
            </div>

            <div
              class="flex-1 h-1 mx-2 rounded-full"
              :class="ocrStep >= 3 ? 'bg-primary/30' : 'bg-neutral-100'"
            ></div>

            <div class="flex items-center">
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full text-xs font-black transition-all shadow-sm"
                :class="
                  ocrStep >= 3
                    ? 'bg-primary text-white ring-2 ring-primary/20 ring-offset-2'
                    : 'bg-neutral-100 text-neutral-400'
                "
              >
                3
              </div>
              <span
                class="ml-2 text-[10px] font-black uppercase tracking-widest hidden sm:block"
                :class="ocrStep >= 3 ? 'text-primary' : 'text-neutral-400'"
              >
                {{ $t("ocr.review") }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="ocrStep === 1" class="space-y-6">
          <!-- Drag and Drop Zone -->
          <div
            class="border-2 border-dashed rounded-3xl p-10 transition-all duration-300 cursor-pointer w-full min-h-[240px] flex flex-col items-center justify-center relative overflow-hidden group"
            :class="[
              isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 hover:border-neutral-300',
              previewUrl ? 'border-green-400/50 bg-green-50/50' : '',
            ]"
            @drop="handleDrop"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            @click="$refs.fileInput.click()"
          >
            <div v-if="!previewUrl" class="text-center">
              <div
                class="mx-auto w-16 h-16 mb-6 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-neutral-100 group-hover:scale-110 transition-transform"
              >
                <HugeiconsIcon
                  :icon="CloudUploadIcon"
                  size="32"
                  class="text-neutral-300"
                />
              </div>
              <h3
                class="text-sm font-black text-neutral-700 tracking-tight mb-2"
              >
                {{ isDragOver ? $t("ocr.dropZone") : $t("ocr.clickSelect") }}
              </h3>
              <p
                class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest"
              >
                JPG, PNG, WebP
              </p>
              <input
                ref="fileInput"
                id="bill-image-ocr"
                type="file"
                accept="image/*"
                @change="handleImageUpload"
                class="hidden"
              />
            </div>

            <div
              v-else
              class="absolute inset-0 flex flex-col items-center justify-center p-4 bg-white/90 backdrop-blur-md"
            >
              <img
                :src="previewUrl"
                alt="Receipt preview"
                class="w-full h-full object-contain rounded-2xl drop-shadow-md mb-2"
              />
              <div
                class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5"
              >
                <button
                  @click.stop="resetOcrForm"
                  class="bg-white/90 backdrop-blur px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-neutral-700 shadow-2xl border border-neutral-100 hover:bg-white active:scale-95 transition-all"
                >
                  {{ $t("ocr.changeImage") }}
                </button>
              </div>
            </div>
          </div>

          <div class="flex gap-4">
            <button
              @click="processReceiptImage"
              :disabled="!previewUrl"
              class="flex-1 bg-neutral-800 text-white font-black text-[12px] uppercase tracking-widest py-4 px-6 rounded-2xl hover:bg-neutral-900 transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
                />
              </svg>
              {{ $t("ocr.scanReceipt") }}
            </button>
          </div>
        </div>

        <div v-if="ocrStep === 2" class="space-y-6 py-8">
          <div class="flex flex-col items-center justify-center text-center">
            <div class="relative w-24 h-24 mb-6">
              <div
                class="absolute inset-0 border-4 border-primary/10 rounded-full"
              ></div>
              <div
                class="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"
              ></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  class="w-8 h-8 text-primary animate-pulse"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
                  />
                </svg>
              </div>
            </div>
            <h2 class="text-xl font-black text-neutral-800 tracking-tight mb-2">
              {{ $t("ocr.processing") }}
            </h2>
            <div
              v-if="downloadProgress > 0"
              class="w-full max-w-xs mx-auto mt-4"
            >
              <div
                class="w-full bg-neutral-100 rounded-full h-2 overflow-hidden"
              >
                <div
                  class="bg-primary h-full rounded-full transition-all duration-300"
                  :style="{ width: Math.min(downloadProgress, 100) + '%' }"
                ></div>
              </div>
              <p
                class="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mt-3"
              >
                {{ Math.min(downloadProgress, 100) }}%
              </p>
            </div>
          </div>
        </div>

        <div v-if="ocrStep === 3" class="space-y-6">
          <div
            class="bg-neutral-50 rounded-2xl p-5 border border-neutral-100 flex items-center justify-between"
          >
            <div>
              <h3
                class="text-sm font-black text-neutral-800 tracking-tight mb-1"
              >
                {{ $t("ocr.itemsFound") }}
              </h3>
              <p
                class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest"
              >
                {{ extractedItems.length }} {{ $t("bills.items") }}
              </p>
            </div>
            <div class="text-right">
              <div class="text-2xl font-black text-primary">
                <span class="text-lg opacity-60 mr-0.5">฿</span
                >{{
                  formatCurrency(
                    extractedItems
                      .filter((item) => item.selected)
                      .reduce((sum, item) => sum + item.amount, 0)
                  )
                }}
              </div>
              <p
                class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest"
              >
                {{ extractedItems.filter((item) => item.selected).length }}
                {{ $t("ocr.selected") }}
              </p>
            </div>
          </div>

          <div
            class="space-y-3 max-h-[40vh] overflow-y-auto pr-2 scrollbar-hide"
          >
            <div
              v-for="(item, index) in extractedItems"
              :key="index"
              class="border-2 rounded-2xl p-4 transition-all duration-200"
              :class="
                item.selected
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-neutral-100 hover:border-neutral-200'
              "
            >
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 pt-1">
                  <input
                    type="checkbox"
                    v-model="item.selected"
                    class="w-5 h-5 text-primary rounded border-neutral-300 focus:ring-primary/20 accent-primary cursor-pointer"
                  />
                </div>
                <div class="flex-grow space-y-3">
                  <div>
                    <label
                      class="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5"
                      >{{ $t("bills.description") }}</label
                    >
                    <input
                      type="text"
                      v-model="item.description"
                      class="w-full px-3 py-2.5 rounded-xl bg-white border border-neutral-200 focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-sm text-neutral-700"
                    />
                  </div>
                  <div>
                    <label
                      class="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5"
                      >{{ $t("bills.amount") }}</label
                    >
                    <input
                      type="number"
                      v-model.number="item.amount"
                      step="0.01"
                      min="0"
                      class="w-full px-3 py-2.5 rounded-xl bg-white border border-neutral-200 focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all outline-none font-black text-sm text-neutral-700"
                      @keypress="preventNonNumberInput"
                    />
                  </div>
                </div>
                <div class="flex-shrink-0 pt-6">
                  <button
                    @click="removeOcrItem(index)"
                    class="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      class="w-5 h-5"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="rawOcrText" class="mt-4">
            <button
              @click="showRawText = !showRawText"
              class="text-[10px] font-bold text-neutral-400 hover:text-neutral-600 uppercase tracking-widest transition-colors flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-3.5 h-3.5"
                :class="showRawText ? 'rotate-180' : ''"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
              {{ showRawText ? $t("ocr.hideRawText") : $t("ocr.showRawText") }}
            </button>
            <div
              v-if="showRawText"
              class="mt-3 bg-neutral-900 rounded-2xl p-4 max-h-40 overflow-y-auto"
            >
              <pre
                class="text-[11px] text-green-400 whitespace-pre-wrap font-mono"
                >{{ rawOcrText }}</pre
              >
            </div>
          </div>

          <div
            v-if="ocrError"
            class="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2.5"
              stroke="currentColor"
              class="w-5 h-5 flex-shrink-0"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
            {{ ocrError }}
          </div>

          <div
            v-if="successMessage"
            class="bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2.5"
              stroke="currentColor"
              class="w-5 h-5 flex-shrink-0"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            {{ successMessage }}
          </div>

          <div class="flex gap-3">
            <button
              @click="startOcrOver"
              class="bg-white border-2 border-neutral-200 text-neutral-600 font-black text-[11px] uppercase tracking-widest py-4 px-6 rounded-2xl hover:bg-neutral-50 hover:border-neutral-300 transition-all active:scale-95 flex-1"
            >
              {{ $t("ocr.startOver") }}
            </button>
            <button
              @click="addSelectedItemsToBills"
              :disabled="
                extractedItems.filter((item) => item.selected).length === 0
              "
              class="bg-neutral-800 text-white font-black text-[11px] uppercase tracking-widest py-4 px-6 rounded-2xl hover:bg-neutral-900 transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex-[2]"
            >
              {{
                $t("ocr.addItems", {
                  count: extractedItems.filter((item) => item.selected).length,
                })
              }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-modalIn {
  animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
