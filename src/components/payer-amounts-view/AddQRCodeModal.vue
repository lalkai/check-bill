<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const { t: $t } = useI18n();

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["generate-qr", "close"]);

const inputPromptpay = ref("");

const handleGenerateQR = () => {
  emit("generate-qr", inputPromptpay.value);
  inputPromptpay.value = "";
};
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 flex items-center justify-center z-50 transition-all p-4"
    >
      <div
        class="absolute inset-0 bg-black/40 backdrop-blur-sm"
        @click="$emit('close')"
      ></div>

      <div
        class="relative bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-md p-8 animate-modalIn border border-white/20"
      >
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-black text-neutral-800 tracking-tight">
            {{ $t("qr.addTitle") }}
          </h2>
          <button
            @click="$emit('close')"
            class="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors"
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
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="mb-8">
          <label
            for="promptpay-input"
            class="block text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-3"
            >{{ $t("qr.promptpayId") }}</label
          >
          <input
            id="promptpay-input"
            v-model="inputPromptpay"
            type="text"
            :placeholder="$t('qr.promptpayPlaceholder')"
            class="w-full px-5 py-4 rounded-2xl bg-neutral-50 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-neutral-700 placeholder-neutral-300"
            @keyup.enter="handleGenerateQR"
          />
        </div>

        <div class="flex gap-4">
          <button
            @click="handleGenerateQR"
            :disabled="!inputPromptpay.trim()"
            class="flex-1 bg-neutral-800 text-white font-black text-[12px] uppercase tracking-widest py-4 px-6 rounded-2xl hover:bg-neutral-900 transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ $t("qr.generate") }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
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
