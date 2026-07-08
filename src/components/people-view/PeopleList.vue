<script setup>
import { computed } from "vue";
import { useBillGroupsStore } from "../../stores/BillGroups";
import PersonCard from "./PersonCard.vue";
import SectionLabel from "../common/SectionLabel.vue";
import { useI18n } from "vue-i18n";

const { t: $t } = useI18n();
const groupsStore = useBillGroupsStore();

const sortedPeople = computed(() => {
  const list = [...groupsStore.activePeople];
  const ownerName = groupsStore.activeGroup?.ownerName || "";

  return list.sort((a, b) => {
    if (a.name === ownerName) return -1;
    if (b.name === ownerName) return 1;
    return a.name.localeCompare(b.name, "th");
  });
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between mb-4 px-2">
      <SectionLabel>{{ $t("people.groupMembers") }}</SectionLabel>
    </div>
    <div
      class="bg-white rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100/50"
    >
      <ul class="divide-y divide-neutral-50/50" v-auto-animate>
        <PersonCard
          v-for="(person, index) in sortedPeople"
          :key="person.name"
          :person="person"
          :style="{ animationDelay: `${index * 40}ms` }"
        />
      </ul>
    </div>
  </div>
</template>
