<script setup>
import { useI18n } from "vue-i18n";
import { HugeiconsIcon } from "@hugeicons/vue";
import { getIcon } from "../../utils/icons";

const { t: $t } = useI18n();

const props = defineProps({
  icon: { type: String, default: "general" },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  actionLabel: { type: String, default: "" },
});

const emit = defineEmits(["action"]);
</script>

<template>
  <div
    class="bg-white rounded-[2.5rem] p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100/50 flex flex-col items-center"
  >
    <div
      class="w-20 h-20 mx-auto rounded-[1.5rem] bg-neutral-50 flex items-center justify-center border border-neutral-100 mb-6"
    >
      <HugeiconsIcon :icon="getIcon(icon)" size="40" class="text-neutral-300" />
    </div>
    <h3 class="text-neutral-700 font-black text-lg mb-2">
      {{ title }}
    </h3>
    <p v-if="description" class="text-neutral-400 text-sm font-medium mb-2 max-w-xs">
      {{ description }}
    </p>
    <button
      v-if="actionLabel"
      @click="emit('action')"
      class="mt-2 bg-neutral-800 text-white font-black text-[11px] uppercase tracking-widest py-3 px-6 rounded-2xl hover:bg-neutral-900 transition-all active:scale-95 shadow-lg"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>
