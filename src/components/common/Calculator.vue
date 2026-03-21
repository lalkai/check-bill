<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const { t: $t } = useI18n();

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "apply"]);

const display = ref("0");
const previousValue = ref("");
const operator = ref("");
const waitingForOperand = ref(false);

function handleDigit(digit) {
  if (waitingForOperand.value) {
    display.value = digit;
    waitingForOperand.value = false;
  } else {
    display.value = display.value === "0" ? digit : display.value + digit;
  }
}

function handleDecimal() {
  if (waitingForOperand.value) {
    display.value = "0.";
    waitingForOperand.value = false;
    return;
  }
  if (!display.value.includes(".")) {
    display.value += ".";
  }
}

function handleOperator(nextOperator) {
  previousValue.value = parseFloat(display.value);
  operator.value = nextOperator;
  waitingForOperand.value = true;
}

function performCalculation(first, second, op) {
  switch (op) {
    case "+":
      return first + second;
    case "-":
      return first - second;
    case "×":
      return first * second;
    case "÷":
      return second !== 0 ? first / second : first;
    default:
      return second;
  }
}

function handleEquals() {
  if (operator.value && previousValue.value !== "") {
    const inputValue = parseFloat(display.value);
    const result = performCalculation(
      previousValue.value,
      inputValue,
      operator.value
    );
    display.value = String(result);
    previousValue.value = "";
    operator.value = "";
    waitingForOperand.value = true;
  }
}

function handleClear() {
  display.value = "0";
  previousValue.value = "";
  operator.value = "";
  waitingForOperand.value = false;
}

function handleBackspace() {
  if (display.value.length > 1) {
    display.value = display.value.slice(0, -1);
  } else {
    display.value = "0";
  }
}

function applyResult() {
  emit("apply", display.value);
  emit("update:modelValue", false);
  handleClear();
}

function closeCalculator() {
  emit("update:modelValue", false);
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity"
          @click="closeCalculator"
        ></div>

        <!-- Calculator Container -->
        <div
          class="relative bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white/20 w-full max-w-[340px] overflow-hidden animate-modalIn"
        >
          <!-- Header/Title -->
          <div class="px-8 pt-8 flex justify-between items-center">
            <h3
              class="text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em]"
            >
              {{ $t("tools.calculator") || "Calculator" }}
            </h3>
            <button
              @click="closeCalculator"
              class="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2.5"
                stroke="currentColor"
                class="w-4 h-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Display Section -->
          <div class="px-8 pt-6 pb-4">
            <div
              class="bg-neutral-50/50 border border-neutral-100 rounded-3xl p-6 text-right min-h-[120px] flex flex-col justify-end gap-1 shadow-inner"
            >
              <div
                v-if="previousValue !== '' || operator"
                class="text-xs font-bold text-neutral-300 uppercase tracking-widest h-4"
              >
                {{ previousValue }} {{ operator }}
              </div>
              <div
                class="text-4xl font-black text-neutral-700 break-all leading-none tracking-tight"
              >
                {{ display }}
              </div>
            </div>
          </div>

          <!-- Keypad Section -->
          <div class="px-8 pb-8 flex flex-col gap-4">
            <div class="grid grid-cols-4 gap-3">
              <!-- Row 1 -->
              <button
                @click="handleClear"
                class="col-span-2 h-14 bg-red-50 text-red-500 font-black text-xs uppercase tracking-widest rounded-2xl border border-red-100/50 hover:bg-red-100 active:scale-95 transition-all"
              >
                {{ $t("actions.clear") }}
              </button>
              <button
                @click="handleBackspace"
                class="h-14 bg-neutral-50 text-neutral-500 rounded-2xl border border-neutral-100/50 flex items-center justify-center hover:bg-neutral-100 active:scale-95 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2.2"
                  stroke="currentColor"
                  class="w-5 h-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 19h12a2 2 0 002-2V7a2 2 0 00-2-2H9L3 12l6 7z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 9l6 6m0-6l-6 6"
                  />
                </svg>
              </button>
              <button
                @click="handleOperator('÷')"
                class="h-14 bg-primary/5 text-primary text-xl font-black rounded-2xl border border-primary/10 hover:bg-primary/10 active:scale-95 transition-all"
                :class="operator === '÷' ? 'bg-primary text-white' : ''"
              >
                ÷
              </button>

              <!-- Row 2 -->
              <button
                v-for="n in ['7', '8', '9']"
                :key="n"
                @click="handleDigit(n)"
                class="h-14 bg-white text-neutral-700 font-black text-lg rounded-2xl border border-neutral-100 shadow-sm hover:border-neutral-200 hover:bg-neutral-50 active:scale-95 transition-all"
              >
                {{ n }}
              </button>
              <button
                @click="handleOperator('×')"
                class="h-14 bg-primary/5 text-primary text-xl font-black rounded-2xl border border-primary/10 hover:bg-primary/10 active:scale-95 transition-all"
                :class="operator === '×' ? 'bg-primary text-white' : ''"
              >
                ×
              </button>

              <!-- Row 3 -->
              <button
                v-for="n in ['4', '5', '6']"
                :key="n"
                @click="handleDigit(n)"
                class="h-14 bg-white text-neutral-700 font-black text-lg rounded-2xl border border-neutral-100 shadow-sm hover:border-neutral-200 hover:bg-neutral-50 active:scale-95 transition-all"
              >
                {{ n }}
              </button>
              <button
                @click="handleOperator('-')"
                class="h-14 bg-primary/5 text-primary text-xl font-black rounded-2xl border border-primary/10 hover:bg-primary/10 active:scale-95 transition-all"
                :class="operator === '-' ? 'bg-primary text-white' : ''"
              >
                -
              </button>

              <!-- Row 4 -->
              <button
                v-for="n in ['1', '2', '3']"
                :key="n"
                @click="handleDigit(n)"
                class="h-14 bg-white text-neutral-700 font-black text-lg rounded-2xl border border-neutral-100 shadow-sm hover:border-neutral-200 hover:bg-neutral-50 active:scale-95 transition-all"
              >
                {{ n }}
              </button>
              <button
                @click="handleOperator('+')"
                class="h-14 bg-primary/5 text-primary text-xl font-black rounded-2xl border border-primary/10 hover:bg-primary/10 active:scale-95 transition-all"
                :class="operator === '+' ? 'bg-primary text-white' : ''"
              >
                +
              </button>

              <!-- Row 5 -->
              <button
                @click="handleDigit('0')"
                class="col-span-2 h-14 bg-white text-neutral-700 font-black text-lg rounded-2xl border border-neutral-100 shadow-sm hover:border-neutral-200 hover:bg-neutral-50 active:scale-95 transition-all"
              >
                0
              </button>
              <button
                @click="handleDecimal"
                class="h-14 bg-white text-neutral-700 font-black text-lg rounded-2xl border border-neutral-100 shadow-sm hover:border-neutral-200 hover:bg-neutral-50 active:scale-95 transition-all"
              >
                .
              </button>
              <button
                @click="handleEquals"
                class="h-14 bg-neutral-800 text-white text-xl font-black rounded-2xl shadow-lg border border-neutral-900 hover:bg-neutral-700 active:scale-95 transition-all"
              >
                =
              </button>
            </div>

            <!-- Apply/Action Section -->
            <div class="flex gap-3">
              <button
                @click="applyResult"
                class="flex-1 bg-primary text-white font-black text-[12px] uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-dark active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="3"
                  stroke="currentColor"
                  class="w-4 h-4"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
                {{ $t("actions.apply") || "APPLY" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-modalIn {
  animation: modalIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
