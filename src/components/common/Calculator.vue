<script setup>
import { ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'apply']);

const display = ref('0');
const previousValue = ref('');
const operator = ref('');
const waitingForOperand = ref(false);

function handleDigit(digit) {
  if (waitingForOperand.value) {
    display.value = digit;
    waitingForOperand.value = false;
  } else {
    display.value = display.value === '0' ? digit : display.value + digit;
  }
}

function handleDecimal() {
  if (waitingForOperand.value) {
    display.value = '0.';
    waitingForOperand.value = false;
    return;
  }
  if (!display.value.includes('.')) {
    display.value += '.';
  }
}

function handleOperator(nextOperator) {
  previousValue.value = parseFloat(display.value);
  operator.value = nextOperator;
  waitingForOperand.value = true;
}

function performCalculation(first, second, op) {
  switch (op) {
    case '+': return first + second;
    case '-': return first - second;
    case '×': return first * second;
    case '÷': return second !== 0 ? first / second : first;
    default: return second;
  }
}

function handleEquals() {
  if (operator.value && previousValue.value !== '') {
    const inputValue = parseFloat(display.value);
    const result = performCalculation(previousValue.value, inputValue, operator.value);
    display.value = String(result);
    previousValue.value = '';
    operator.value = '';
    waitingForOperand.value = true;
  }
}

function handleClear() {
  display.value = '0';
  previousValue.value = '';
  operator.value = '';
  waitingForOperand.value = false;
}

function handleBackspace() {
  if (display.value.length > 1) {
    display.value = display.value.slice(0, -1);
  } else {
    display.value = '0';
  }
}

function applyResult() {
  emit('apply', display.value);
  emit('update:modelValue', false);
  handleClear();
}

function closeCalculator() {
  emit('update:modelValue', false);
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
        <div class="fixed inset-0 bg-black/40" @click="closeCalculator"></div>
        <div class="relative bg-white rounded-lg shadow-lg p-6 w-80 max-w-[90vw]">
          <div class="bg-neutral-100 rounded-xl p-4 mb-4">
            <div v-if="previousValue || operator" class="text-right text-lg text-neutral-500 mb-1">
              {{ previousValue }} {{ operator }}
            </div>
            <div class="text-right text-3xl font-semibold text-neutral-800 break-all">
              {{ display }}
            </div>
          </div>

          <div class="grid grid-cols-4 gap-2 mb-4">
            <button @click="handleClear" class="a-button-secondary col-span-2">
              ล้าง
            </button>
            <button @click="handleBackspace" class="a-button-secondary">
              ⌫
            </button>
            <button @click="handleOperator('÷')" class="a-button-secondary">
              ÷
            </button>

            <button @click="handleDigit('7')" class="a-button-secondary">
              7
            </button>
            <button @click="handleDigit('8')" class="a-button-secondary">
              8
            </button>
            <button @click="handleDigit('9')" class="a-button-secondary">
              9
            </button>
            <button @click="handleOperator('×')" class="a-button-secondary">
              ×
            </button>

            <button @click="handleDigit('4')" class="a-button-secondary">
              4
            </button>
            <button @click="handleDigit('5')" class="a-button-secondary">
              5
            </button>
            <button @click="handleDigit('6')" class="a-button-secondary">
              6
            </button>
            <button @click="handleOperator('-')" class="a-button-secondary">
              -
            </button>

            <button @click="handleDigit('1')" class="a-button-secondary">
              1
            </button>
            <button @click="handleDigit('2')" class="a-button-secondary">
              2
            </button>
            <button @click="handleDigit('3')" class="a-button-secondary">
              3
            </button>
            <button @click="handleOperator('+')" class="a-button-secondary">
              +
            </button>

            <button @click="handleDigit('0')" class="a-button-secondary col-span-2">
              0
            </button>
            <button @click="handleDecimal" class="a-button-secondary">
              .
            </button>
            <button @click="handleEquals" class="a-button-primary">
              =
            </button>
          </div>

          <div class="flex gap-2">
            <button @click="closeCalculator" class="a-button-secondary flex-1">
              ยกเลิก
            </button>
            <button @click="applyResult" class="a-button-primary flex-1">
              ยืนยัน
            </button>
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

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>
