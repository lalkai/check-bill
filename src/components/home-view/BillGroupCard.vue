<script setup>
import { useI18n } from "vue-i18n";
const { t: $t } = useI18n();
const props = defineProps({
  group: { type: Object, required: true },
  billCount: { type: Number, default: 0 },
  peopleCount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
});

const emit = defineEmits(["click", "edit", "delete"]);

import { formatCurrency } from "../../utils/common";
import { HugeiconsIcon } from "@hugeicons/vue";
import { PencilEdit01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { getIcon } from "../../utils/icons";

function onEdit(e) {
  e.stopPropagation();
  emit("edit");
}

function onDelete(e) {
  e.stopPropagation();
  emit("delete");
}
</script>

<template>
  <div
    class="bg-white rounded-[2.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100/50 cursor-pointer group relative transition-all hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1"
    @click="emit('click')"
  >
    <div class="flex justify-between items-start mb-6 gap-4">
      <div class="flex items-center gap-4 flex-1 min-w-0">
        <!-- Colored Icon Box -->
        <div
          class="w-14 h-14 flex-shrink-0 rounded-[1.25rem] flex items-center justify-center text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
          :style="{ backgroundColor: group.color }"
        >
          <HugeiconsIcon
            :icon="getIcon(group.icon)"
            size="28"
            :stroke-width="2.5"
          />
        </div>

        <!-- Title & Subtitle -->
        <div class="flex flex-col min-w-0">
          <h3
            class="font-black text-neutral-800 text-xl tracking-tight mb-0.5 truncate w-full"
          >
            {{ group.name }}
          </h3>
          <div
            class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest flex items-center gap-2"
          >
            <span class="flex items-center gap-1">
              {{ $t("group.peopleCount", { count: peopleCount }) }}
            </span>
            <span class="w-1 h-1 rounded-full bg-neutral-300"></span>
            <span>{{ $t("group.billCount", { count: billCount }) }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div
        class="flex items-center gap-2 transition-opacity duration-200 opacity-100 flex-shrink-0"
      >
        <button
          @click="onEdit"
          class="p-2 rounded-xl bg-neutral-50 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors flex items-center justify-center cursor-pointer"
          :title="$t('actions.edit')"
        >
          <HugeiconsIcon
            :icon="PencilEdit01Icon"
            size="16"
            :stroke-width="2.5"
          />
        </button>
        <button
          @click="onDelete"
          class="p-2 rounded-xl bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center cursor-pointer"
          :title="$t('actions.delete')"
        >
          <HugeiconsIcon :icon="Delete02Icon" size="16" :stroke-width="2.5" />
        </button>
      </div>
    </div>

    <div
      class="flex items-end justify-between border-t border-dashed border-neutral-100/80 pt-4 mt-2 gap-4"
    >
      <div
        class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest pb-1 flex-shrink-0"
      >
        {{ $t("group.totalSpend") }}
      </div>
      <div
        class="text-2xl font-black transition-colors duration-200 truncate min-w-0"
        :style="{ color: group.color }"
      >
        <span class="text-lg opacity-80 mr-0.5">฿</span
        >{{ formatCurrency(totalAmount) }}
      </div>
    </div>
  </div>
</template>
