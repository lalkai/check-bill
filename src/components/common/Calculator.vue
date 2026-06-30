<script setup>
import { ref, computed } from "vue";
import { useScrollLock } from "../../composables/useScrollLock";
import { useI18n } from "vue-i18n";
import CloseButton from "./CloseButton.vue";

const { t: $t } = useI18n();

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});
useScrollLock(computed(() => props.modelValue));

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
    <Transition name="calc-modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-end justify-center p-3 sm:p-4 sm:items-center"
      >
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity"
          @click="closeCalculator"
        ></div>

        <!-- Calculator Container -->
        <div
          class="relative calculator-modal bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-white/20 w-full max-w-[320px] xs:max-w-[340px] overflow-hidden my-auto max-h-[96vh] flex flex-col"
        >
          <!-- Header/Title -->
          <div class="px-5 pt-5 xs:px-8 xs:pt-8 flex justify-between items-center shrink-0">
            <h3
              class="text-[11px] font-black text-neutral-400 uppercase tracking-[0.15em]"
            >
              {{ $t("tools.calculator") || "Calculator" }}
            </h3>
            <CloseButton @click="closeCalculator" />
          </div>
 
          <!-- Display Section -->
          <div class="px-5 pt-3 pb-2 xs:px-8 xs:pt-6 xs:pb-4 shrink-0">
            <div
              class="bg-neutral-50/50 border border-neutral-100 rounded-2xl xs:rounded-3xl p-4 xs:p-6 text-right min-h-[80px] xs:min-h-[120px] flex flex-col justify-end gap-1 shadow-inner"
            >
              <div
                v-if="previousValue !== '' || operator"
                class="text-xs font-bold text-neutral-300 uppercase tracking-widest h-4"
              >
                {{ previousValue }} {{ operator }}
              </div>
              <div
                class="text-3xl xs:text-4xl font-black text-neutral-700 break-all leading-none tracking-tight"
              >
                {{ display }}
              </div>
            </div>
          </div>
 
          <!-- Keypad Section -->
          <div class="px-5 pb-5 xs:px-8 xs:pb-8 flex flex-col gap-3 xs:gap-4 overflow-y-auto scrollbar-hide">
            <div class="grid grid-cols-4 gap-2 xs:gap-3">
              <!-- Row 1 -->
              <button
                @click="handleClear"
                class="col-span-2 h-11 xs:h-14 bg-red-50 text-red-500 font-black text-xs uppercase tracking-widest rounded-xl xs:rounded-2xl border border-red-100/50 hover:bg-red-100 active:scale-95 transition-all cursor-pointer"
              >
                {{ $t("actions.clear") }}
              </button>
              <button
                @click="handleBackspace"
                class="h-11 xs:h-14 bg-neutral-50 text-neutral-500 rounded-xl xs:rounded-2xl border border-neutral-100/50 flex items-center justify-center hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  :stroke-width="2.2"
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
                class="h-11 xs:h-14 bg-primary/5 text-primary text-xl font-black rounded-xl xs:rounded-2xl border border-primary/10 hover:bg-primary/10 active:scale-95 transition-all cursor-pointer"
                :class="operator === '÷' ? 'bg-primary text-white' : ''"
              >
                ÷
              </button>
 
              <!-- Row 2 -->
              <button
                v-for="n in ['7', '8', '9']"
                :key="n"
                @click="handleDigit(n)"
                class="h-11 xs:h-14 bg-white text-neutral-700 font-black text-lg rounded-xl xs:rounded-2xl border border-neutral-100 shadow-sm hover:border-neutral-200 hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
              >
                {{ n }}
              </button>
              <button
                @click="handleOperator('×')"
                class="h-11 xs:h-14 bg-primary/5 text-primary text-xl font-black rounded-xl xs:rounded-2xl border border-primary/10 hover:bg-primary/10 active:scale-95 transition-all cursor-pointer"
                :class="operator === '×' ? 'bg-primary text-white' : ''"
              >
                ×
              </button>
 
              <!-- Row 3 -->
              <button
                v-for="n in ['4', '5', '6']"
                :key="n"
                @click="handleDigit(n)"
                class="h-11 xs:h-14 bg-white text-neutral-700 font-black text-lg rounded-xl xs:rounded-2xl border border-neutral-100 shadow-sm hover:border-neutral-200 hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
              >
                {{ n }}
              </button>
              <button
                @click="handleOperator('-')"
                class="h-11 xs:h-14 bg-primary/5 text-primary text-xl font-black rounded-xl xs:rounded-2xl border border-primary/10 hover:bg-primary/10 active:scale-95 transition-all cursor-pointer"
                :class="operator === '-' ? 'bg-primary text-white' : ''"
              >
                -
              </button>
 
              <!-- Row 4 -->
              <button
                v-for="n in ['1', '2', '3']"
                :key="n"
                @click="handleDigit(n)"
                class="h-11 xs:h-14 bg-white text-neutral-700 font-black text-lg rounded-xl xs:rounded-2xl border border-neutral-100 shadow-sm hover:border-neutral-200 hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
              >
                {{ n }}
              </button>
              <button
                @click="handleOperator('+')"
                class="h-11 xs:h-14 bg-primary/5 text-primary text-xl font-black rounded-xl xs:rounded-2xl border border-primary/10 hover:bg-primary/10 active:scale-95 transition-all cursor-pointer"
                :class="operator === '+' ? 'bg-primary text-white' : ''"
              >
                +
              </button>
 
              <!-- Row 5 -->
              <button
                @click="handleDigit('0')"
                class="col-span-2 h-11 xs:h-14 bg-white text-neutral-700 font-black text-lg rounded-xl xs:rounded-2xl border border-neutral-100 shadow-sm hover:border-neutral-200 hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
              >
                0
              </button>
              <button
                @click="handleDecimal"
                class="h-11 xs:h-14 bg-white text-neutral-700 font-black text-lg rounded-xl xs:rounded-2xl border border-neutral-100 shadow-sm hover:border-neutral-200 hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
              >
                .
              </button>
              <button
                @click="handleEquals"
                class="h-11 xs:h-14 bg-neutral-800 text-white text-xl font-black rounded-xl xs:rounded-2xl shadow-lg border border-neutral-900 hover:bg-neutral-700 active:scale-95 transition-all cursor-pointer"
              >
                =
              </button>
            </div>
 
            <!-- Apply/Action Section -->
            <div class="flex gap-3 shrink-0">
              <button
                @click="applyResult"
                class="flex-1 bg-primary text-white font-black text-[12px] uppercase tracking-widest py-3.5 xs:py-4 rounded-xl xs:rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-dark active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  :stroke-width="3"
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
