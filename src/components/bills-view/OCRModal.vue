<script setup>
import { ref, watch } from "vue";
import { useBillStore } from "../../stores/Bills";

const billStore = useBillStore();

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

const API_BASE_URL = "https://satjawat.com";

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      resetOcrForm();
    }
  }
);

function closeOcrModal() {
  emit("close");
}

function handleImageUpload(event) {
  ocrError.value = "";
  successMessage.value = "";
  extractedItems.value = "";
  const file = event.target?.files?.[0] || event.dataTransfer?.files?.[0];
  
  if (!file) {
    receiptImageFile.value = null;
    previewUrl.value = "";
    ocrStep.value = 1;
    return;
  }  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxFileSize = 10 * 1024 * 1024;
  
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    ocrError.value = "กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WebP)";
    return;
  }
  
  if (file.size > maxFileSize) {
    ocrError.value = "ขนาดไฟล์ใหญ่เกินไป (สูงสุด 10MB)";
    return;
  }
  
  if (file.name.length > 255) {
    ocrError.value = "ชื่อไฟล์ยาวเกินไป";
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
    ocrError.value = "กรุณาเลือกรูปภาพใบเสร็จ";
    return;
  }

  ocrStep.value = 2;
  ocrProcessing.value = true;
  ocrError.value = "";
  successMessage.value = "";
  extractedItems.value = [];

  try {    const formData = new FormData();
    formData.append("image", receiptImageFile.value);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${API_BASE_URL}/api/ocr`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: การประมวลผลล้มเหลว`);
    }    const result = await response.json();

    if (!result || typeof result !== 'object') {
      throw new Error("ได้รับข้อมูลที่ไม่ถูกต้องจากเซิร์ฟเวอร์");
    }

    if (result.success && result.items && Array.isArray(result.items)) {
      extractedItems.value = result.items;

      if (extractedItems.value.length === 0) {
        ocrError.value = "ไม่พบรายการที่ถูกต้องในรูปภาพ กรุณาลองรูปภาพอื่น";
        ocrStep.value = 1;
      } else {
        ocrStep.value = 3;
        const validItems = extractedItems.value.filter(
          (item) => item.amount > 0
        ).length;
        successMessage.value = `พบ ${extractedItems.value.length} รายการจากรูปภาพ (${validItems} รายการถูกต้อง)`;
      }
    } else {
      ocrError.value = "ไม่สามารถประมวลผลข้อมูลได้ กรุณาลองอีกครั้ง";
      ocrStep.value = 1;
    }
  } catch (error) {
    console.error("Error processing receipt image:", error);

    if (error.message.includes("Failed to fetch")) {
      ocrError.value =
        "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต";
    } else {
      ocrError.value = error.message || "เกิดข้อผิดพลาดในการประมวลผลรูปภาพ";
    }
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
    ocrError.value = "กรุณาเลือกรายการที่ต้องการเพิ่ม";
    return;
  }
  try {
    itemsToAdd.forEach((item) => {
      const cleanDescription = String(item.description)
        .trim()
        .slice(0, 255)
        .replace(/[<>\"'&]/g, '');
      
      const cleanAmount = Number(item.amount) || 0;
      
      if (cleanAmount < 0 || cleanAmount > 999999.99) {
        throw new Error(`จำนวนเงินไม่ถูกต้อง: ${cleanAmount}`);
      }
      
      const cleanDate = new Date().toISOString().split("T")[0];

      if (!cleanDescription || cleanDescription.length < 1) {
        throw new Error("รายการต้องมีชื่อ");
      }

      billStore.addBill(cleanDescription, cleanAmount, cleanDate);
    });

    successMessage.value = `เพิ่ม ${itemsToAdd.length} รายการเรียบร้อยแล้ว!`;

    setTimeout(() => {
      closeOcrModal();
    }, 1500);
  } catch (error) {
    console.error("Error adding OCR bills:", error);
    ocrError.value = error.message || "เกิดข้อผิดพลาดในการเพิ่มรายการ กรุณาลองอีกครั้ง";
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
  const fileInput = document.getElementById("bill-image-ocr");
  if (fileInput) fileInput.value = "";
}

function startOcrOver() {
  resetOcrForm();
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="ocr-modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div class="flex items-center justify-center min-h-screen p-2 sm:p-4">
      <!-- Background overlay -->
      <div
        class="fixed inset-0 bg-neutral-700/75 transition-opacity"
        aria-hidden="true"
        @click="closeOcrModal"
      ></div>
      <!-- Modal panel -->
      <div
        class="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
      >
        <div class="bg-white p-3 sm:p-4 md:p-6">
          <!-- Modal Header -->
          <div class="flex items-center justify-between mb-4 sm:mb-6">
            <h3
              class="text-lg sm:text-xl md:text-2xl font-semibold text-neutral-800"
              id="ocr-modal-title"
            >
              สแกนใบเสร็จด้วย AI
            </h3>
            <button
              @click="closeOcrModal"
              class="text-neutral-400 hover:text-neutral-600 p-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5 sm:w-6 sm:h-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <!-- Progress Steps -->
          <div class="mb-6 sm:mb-8">
            <div
              class="flex items-center justify-center space-x-2 sm:space-x-4 md:space-x-6"
            >
              <div class="flex items-center">
                <div
                  class="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full text-xs sm:text-sm md:text-base font-medium transition-all"
                  :class="
                    ocrStep >= 1
                      ? 'bg-primary text-white'
                      : 'bg-neutral-200 text-neutral-500'
                  "
                >
                  1
                </div>
                <span
                  class="ml-1 sm:ml-2 md:ml-3 text-xs sm:text-sm md:text-base font-medium"
                  :class="ocrStep >= 1 ? 'text-primary' : 'text-neutral-500'"
                >
                  อัปโหลด
                </span>
              </div>

              <div
                class="flex-1 h-1 md:h-1.5 mx-2 sm:mx-4 md:mx-6 rounded-full"
                :class="ocrStep >= 2 ? 'bg-primary' : 'bg-neutral-200'"
              ></div>

              <div class="flex items-center">
                <div
                  class="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full text-xs sm:text-sm md:text-base font-medium transition-all"
                  :class="
                    ocrStep >= 2
                      ? 'bg-primary text-white'
                      : 'bg-neutral-200 text-neutral-500'
                  "
                >
                  2
                </div>
                <span
                  class="ml-1 sm:ml-2 md:ml-3 text-xs sm:text-sm md:text-base font-medium"
                  :class="ocrStep >= 2 ? 'text-primary' : 'text-neutral-500'"
                >
                  ประมวลผล
                </span>
              </div>

              <div
                class="flex-1 h-1 md:h-1.5 mx-2 sm:mx-4 md:mx-6 rounded-full"
                :class="ocrStep >= 3 ? 'bg-primary' : 'bg-neutral-200'"
              ></div>

              <div class="flex items-center">
                <div
                  class="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full text-xs sm:text-sm md:text-base font-medium transition-all"
                  :class="
                    ocrStep >= 3
                      ? 'bg-primary text-white'
                      : 'bg-neutral-200 text-neutral-500'
                  "
                >
                  3
                </div>
                <span
                  class="ml-1 sm:ml-2 md:ml-3 text-xs sm:text-sm md:text-base font-medium"
                  :class="ocrStep >= 3 ? 'text-primary' : 'text-neutral-500'"
                >
                  ตรวจสอบ
                </span>
              </div>
            </div>
          </div>
          <!-- Step 1: Upload -->
          <div v-if="ocrStep === 1" class="space-y-4 sm:space-y-6">
            <!-- Drag and Drop Zone -->
            <div
              class="border-2 border-dashed rounded-lg p-4 sm:p-6 md:p-8 transition-all duration-300 cursor-pointer hover:border-primary/50 hover:bg-primary/5 aspect-square mx-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
              :class="[
                isDragOver
                  ? 'border-primary bg-primary/10'
                  : 'border-neutral-300',
                previewUrl ? 'border-green-400 bg-green-50' : '',
              ]"
              @drop="handleDrop"
              @dragover="handleDragOver"
              @dragleave="handleDragLeave"
              @click="$refs.fileInput.click()"
            >
              <div class="text-center h-full flex flex-col justify-center">
                <div v-if="!previewUrl" class="space-y-3 sm:space-y-4">
                  <!-- Upload Icon -->
                  <div
                    class="mx-auto w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 flex items-center justify-center rounded-full"
                    :class="isDragOver ? 'bg-primary/20' : 'bg-neutral-100'"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12"
                      :class="isDragOver ? 'text-primary' : 'text-neutral-400'"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18.75 19.5H6.75Z"
                      />
                    </svg>
                  </div>
                  <!-- Upload Text -->
                  <div>
                    <h3
                      class="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-neutral-800 mb-1"
                    >
                      {{ isDragOver ? "วางไฟล์ที่นี่" : "คลิกเพื่อเลือกไฟล์" }}
                    </h3>
                    <p
                      class="text-xs sm:text-sm md:text-base text-neutral-500 hidden sm:block"
                    >
                      หรือลากและวางไฟล์มาที่นี่
                    </p>
                    <p
                      class="text-xs sm:text-sm md:text-base text-neutral-500 mt-1"
                    >
                      JPG, PNG, WebP
                    </p>
                  </div>

                  <!-- Hidden File Input -->
                  <input
                    ref="fileInput"
                    id="bill-image-ocr"
                    type="file"
                    accept="image/*"
                    @change="handleImageUpload"
                    class="hidden"
                  />
                </div>
                <!-- Image Preview -->
                <div
                  v-else
                  class="space-y-2 sm:space-y-3 h-full flex flex-col justify-center"
                >
                  <div class="relative flex justify-center">
                    <img
                      :src="previewUrl"
                      alt="Receipt preview"
                      class="max-w-full max-h-32 sm:max-h-40 md:max-h-48 lg:max-h-56 xl:max-h-64 rounded-lg shadow-lg object-contain"
                    />
                    <!-- Success indicator -->
                    <div
                      class="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                        class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>

                  <div class="space-y-2">
                    <p class="text-green-600 font-medium text-xs sm:text-sm">
                      ✓ ไฟล์อัปโหลดสำเร็จ
                    </p>
                    <!-- Action Buttons -->
                    <div
                      class="flex gap-2 sm:gap-3 md:gap-4 lg:gap-5 justify-center"
                    >
                      <button
                        @click.stop="resetOcrForm"
                        class="px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-3 lg:px-8 lg:py-4 text-sm sm:text-base md:text-lg text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-all font-medium"
                      >
                        เปลี่ยนไฟล์
                      </button>
                      <button
                        @click.stop="processReceiptImage"
                        class="px-4 py-2 sm:px-5 sm:py-3 md:px-8 md:py-3 lg:px-10 lg:py-4 bg-primary text-white rounded-lg hover:bg-primary-light transition-all shadow-sm flex items-center justify-center gap-2 md:gap-3 font-medium text-sm sm:text-base md:text-lg"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
                          />
                        </svg>
                        สแกน
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Step 2: Processing -->
          <div v-if="ocrStep === 2" class="space-y-4 sm:space-y-6">
            <div
              class="border-2 border-dashed rounded-lg p-4 sm:p-6 md:p-8 transition-all duration-300 aspect-square mx-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg border-primary/30 bg-primary/5 flex flex-col items-center justify-center text-center"
            >
              <div class="mb-4 sm:mb-6">
                <div
                  class="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 mx-auto"
                >
                  <div
                    class="absolute inset-0 border-4 md:border-6 border-primary/20 rounded-full"
                  ></div>
                  <div
                    class="absolute inset-0 border-4 md:border-6 border-primary border-t-transparent rounded-full animate-spin"
                  ></div>
                </div>
              </div>
              <h2
                class="text-lg sm:text-xl md:text-2xl font-bold text-neutral-800 mb-2 sm:mb-3"
              >
                กำลังประมวลผลรูปภาพ
              </h2>
              <p class="text-sm sm:text-base md:text-lg text-neutral-600">
                AI กำลังวิเคราะห์และดึงข้อมูล<br />จากใบเสร็จของคุณ...
              </p>
            </div>
          </div>
          <!-- Step 3: Review -->
          <div v-if="ocrStep === 3" class="space-y-6">
            <div class="text-center mb-4">
              <h2 class="text-xl sm:text-2xl font-bold text-neutral-800 mb-2">
                ตรวจสอบรายการ
              </h2>
              <p class="text-neutral-600 text-sm sm:text-base">
                กรุณาตรวจสอบและแก้ไขข้อมูลก่อนเพิ่มเข้าระบบ
              </p>
            </div>

            <!-- Summary Card -->
            <div
              class="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-lg p-4"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg sm:text-xl font-semibold text-neutral-800">
                    สรุปรายการ
                  </h3>
                  <p class="text-sm sm:text-base text-neutral-600">
                    พบ {{ extractedItems.length }} รายการ
                  </p>
                </div>
                <div class="text-right">
                  <div class="text-xl sm:text-2xl font-bold text-primary">
                    {{
                      extractedItems
                        .filter((item) => item.selected)
                        .reduce((sum, item) => sum + item.amount, 0)
                        .toFixed(2)
                    }}
                    บาท
                  </div>
                  <p class="text-sm sm:text-base text-neutral-600">
                    เลือกแล้ว
                    {{ extractedItems.filter((item) => item.selected).length }}
                    รายการ
                  </p>
                </div>
              </div>
            </div>
            <!-- Items List -->
            <div class="space-y-4 max-h-96 overflow-y-auto">
              <div
                v-for="(item, index) in extractedItems"
                :key="index"
                class="border rounded-lg p-4 hover:shadow-md transition-all duration-300"
                :class="{ 'ring-2 ring-primary/20': item.selected }"
              >
                <div class="flex items-start gap-4">
                  <div class="flex-shrink-0 pt-1">
                    <input
                      type="checkbox"
                      v-model="item.selected"
                      class="w-5 h-5 text-primary rounded border-neutral-300 focus:ring-primary/20"
                    />
                  </div>

                  <div class="flex-grow space-y-3">
                    <div>
                      <label
                        class="block text-sm font-medium text-neutral-700 mb-1"
                        >รายการ</label
                      >
                      <input
                        type="text"
                        v-model="item.description"
                        class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                        placeholder="ชื่อรายการ"
                      />
                    </div>
                    <div>
                      <label
                        class="block text-sm font-medium text-neutral-700 mb-1"
                        >จำนวนเงิน (บาท)</label
                      >
                      <input
                        type="number"
                        v-model.number="item.amount"
                        step="0.01"
                        min="0"
                        class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div class="flex-shrink-0">
                    <button
                      @click="removeOcrItem(index)"
                      class="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="ลบรายการ"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-5 h-5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <!-- Action Buttons -->
            <div class="flex gap-4 pt-4">
              <button
                @click="startOcrOver"
                class="flex-1 px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-all text-sm font-medium"
              >
                เริ่มใหม่
              </button>
              <button
                @click="addSelectedItemsToBills"
                :disabled="
                  extractedItems.filter((item) => item.selected).length === 0
                "
                class="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm"
              >
                เพิ่มรายการ ({{
                  extractedItems.filter((item) => item.selected).length
                }})
              </button>
            </div>
          </div>
          <!-- Error Messages -->
          <div
            v-if="ocrError"
            class="mt-3 sm:mt-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg"
          >
            <div class="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
              <span class="text-xs sm:text-sm">{{ ocrError }}</span>
            </div>
          </div>

          <!-- Success Messages -->
          <div
            v-if="successMessage"
            class="mt-3 sm:mt-4 bg-green-50 border border-green-200 text-green-700 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg"
          >
            <div class="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <span class="text-xs sm:text-sm">{{ successMessage }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes bounce {
  0%,
  20%,
  53%,
  80%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  40%,
  43% {
    transform: translate3d(0, -30px, 0);
  }
  70% {
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
}

.animate-bounce {
  animation: bounce 1.4s infinite;
}
</style>
