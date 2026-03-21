<script setup>
import { usePeopleStore } from "../../stores/People";
import PersonCard from "./PersonCard.vue";
import { useI18n } from "vue-i18n";

const { t: $t } = useI18n();
const peopleStore = usePeopleStore();
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between mb-4 px-2">
      <h2
        class="text-[11px] font-black text-neutral-400 uppercase tracking-[0.15em]"
      >
        {{ $t("people.groupMembers") }}
      </h2>
    </div>
    <div
      class="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100/50 overflow-hidden"
    >
      <ul class="divide-y divide-neutral-50/50">
        <PersonCard
          v-for="(person, index) in peopleStore.list"
          :key="index"
          :person="person"
          :index="index"
        />
      </ul>
    </div>
  </div>
</template>
