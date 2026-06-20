<script setup>
import { ref } from "vue";
import { useBillGroupsStore } from "../../stores/BillGroups";
import { useI18n } from "vue-i18n";
import SectionLabel from "../common/SectionLabel.vue";
import { HugeiconsIcon } from "@hugeicons/vue";
import { Add01Icon } from "@hugeicons/core-free-icons";

const groupsStore = useBillGroupsStore();
const { t: $t } = useI18n();
const newPersonName = ref("");

function addPerson() {
  if (newPersonName.value.trim()) {
    groupsStore.addPerson(newPersonName.value.trim());
    newPersonName.value = "";
  }
}
</script>

<template>
  <div
    class="bg-white rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100/50 mb-8"
  >
    <SectionLabel class="mb-4">{{ $t("people.addMember") }}</SectionLabel>
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="flex-grow">
        <input
          v-model="newPersonName"
          type="text"
          :placeholder="$t('people.namePlaceholder')"
          class="w-full px-5 py-4 rounded-2xl bg-neutral-50 border border-neutral-200 focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-neutral-700 placeholder-neutral-300"
          @keyup.enter="addPerson"
        />
      </div>
      <button
        @click="addPerson"
        :disabled="!newPersonName.trim()"
        class="bg-neutral-800 text-white font-black text-[12px] uppercase tracking-widest py-4 px-8 rounded-2xl hover:bg-neutral-900 transition-all active:scale-95 shadow-lg flex items-center justify-center sm:w-auto w-full gap-2"
      >
        <HugeiconsIcon :icon="Add01Icon" size="20" :stroke-width="3" />
        {{ $t("actions.add") }}
      </button>
    </div>
  </div>
</template>
