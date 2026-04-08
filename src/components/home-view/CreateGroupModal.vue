<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { COLOR_PALETTE } from "../../stores/BillGroups";
import { HugeiconsIcon } from "@hugeicons/vue";
import { Cancel01Icon, Tick01Icon } from "@hugeicons/core-free-icons";

const { t: $t } = useI18n();
const props = defineProps({
  show: { type: Boolean, default: false },
});

const emit = defineEmits(["create", "close"]);

const name = ref("");
const selectedColor = ref(COLOR_PALETTE[0]);

function handleCreate() {
  const trimmed = name.value.trim();
  if (!trimmed) return;
  emit("create", trimmed, selectedColor.value);
  name.value = "";
  selectedColor.value = COLOR_PALETTE[0];
}

function handleClose() {
  name.value = "";
  selectedColor.value = COLOR_PALETTE[0];
  emit("close");
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
        @click="handleClose"
      ></div>

      <!-- Modal -->
      <div
        class="relative bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-md p-8 animate-modalIn border border-white/20 max-h-[90vh] flex flex-col"
      >
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-2xl font-black text-neutral-800 tracking-tight">
            {{ $t("group.createNewGroup") }}
          </h2>
          <button
            @click="handleClose"
            class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-all active:scale-90"
          >
            <HugeiconsIcon :icon="Cancel01Icon" size="20" stroke-width="2.5" />
          </button>
        </div>

        <!-- Name Input -->
        <div class="mb-8">
          <label
            class="block text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-3"
            >{{ $t("group.groupName") }}</label
          >
          <input
            v-model="name"
            type="text"
            :placeholder="$t('group.groupPlaceholder')"
            class="w-full px-5 py-4 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-neutral-700 placeholder-neutral-300"
            @keyup.enter="handleCreate"
            ref="nameInput"
          />
        </div>

        <!-- Color Picker -->
        <div class="mb-10">
          <label
            class="block text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-3"
            >{{ $t("group.selectColor") }}</label
          >
          <div class="flex flex-wrap gap-3">
            <button
              v-for="color in COLOR_PALETTE"
              :key="color"
              @click="selectedColor = color"
              class="w-10 h-10 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center shadow-sm"
              :style="{
                backgroundColor: color,
                '--tw-ring-color':
                  selectedColor === color ? `${color}40` : 'transparent',
              }"
              :class="
                selectedColor === color ? 'ring-4 ring-offset-2 scale-110' : ''
              "
            >
              <HugeiconsIcon
                v-if="selectedColor === color"
                :icon="Tick01Icon"
                size="20"
                stroke-width="3"
                class="text-white drop-shadow-sm"
              />
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-4">
          <button
            @click="handleCreate"
            class="flex-1 bg-neutral-800 text-white font-black text-[12px] uppercase tracking-widest py-4 px-6 rounded-2xl hover:bg-neutral-900 transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!name.trim()"
          >
            {{ $t("actions.create") }}
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
