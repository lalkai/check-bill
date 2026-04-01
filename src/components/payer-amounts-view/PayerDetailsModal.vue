<script setup>
import { useI18n } from "vue-i18n";
const { t: $t } = useI18n();

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  payer: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close"]);

import { formatCurrency } from "../../utils/common";
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show && payer"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        @click="emit('close')"
      ></div>

      <div
        class="relative bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-md p-8 animate-modalIn border border-white/20 max-h-[90vh] flex flex-col"
      >
        <div class="flex justify-between items-start mb-6">
          <div class="flex items-center gap-4 flex-1 min-w-0 pr-4">
            <div
              class="w-14 h-14 flex-shrink-0 rounded-2xl flex items-center justify-center text-white shadow-sm font-black text-xl bg-primary"
            >
              {{ payer.name[0]?.toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <h2
                class="text-xl font-black text-neutral-800 tracking-tight truncate w-full"
              >
                {{ payer.name }}
              </h2>
              <div
                class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5"
              >
                {{ $t("summary.expenseBreakdown") }}
              </div>
            </div>
          </div>
          <button
            @click="emit('close')"
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

        <div class="flex-1 overflow-hidden flex flex-col">
          <div
            class="flex justify-between items-center mb-6 bg-primary/5 px-5 py-4 rounded-2xl border border-primary/10 gap-4"
          >
            <span
              class="text-[11px] font-black text-neutral-500 uppercase tracking-widest flex-shrink-0"
              >{{ $t("summary.total") }}</span
            >
            <span
              class="text-2xl font-black text-primary truncate min-w-0 text-right"
              ><span class="text-lg opacity-60 mr-0.5">฿</span
              >{{ formatCurrency(payer.totalAmountDue) }}</span
            >
          </div>

          <div
            v-if="payer.billItems && payer.billItems.length > 0"
            class="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-hide"
          >
            <div
              v-for="(item, index) in payer.billItems"
              :key="index"
              class="p-4 border-2 border-neutral-100 rounded-2xl bg-neutral-50/50"
            >
              <div class="flex justify-between items-start gap-2">
                <div class="flex-1 min-w-0">
                  <p
                    class="text-sm font-black text-neutral-700 tracking-tight truncate w-full"
                  >
                    {{ item.description }}
                  </p>
                  <div
                    class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1"
                  >
                    {{ item.date }}
                  </div>
                </div>
                <span class="text-sm font-black text-neutral-800 flex-shrink-0"
                  >฿{{ formatCurrency(item.amount) }}</span
                >
              </div>
            </div>
          </div>

          <div
            v-else
            class="text-center py-12 flex-1 flex flex-col justify-center border-2 border-dashed border-neutral-100 rounded-2xl"
          >
            <p
              class="text-[11px] font-black text-neutral-400 uppercase tracking-widest"
            >
              {{ $t("bills.noExpenses") }}
            </p>
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
