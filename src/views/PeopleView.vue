<script setup>
import { useBillGroupsStore } from "../stores/BillGroups";
import AddPersonForm from "../components/people-view/AddPersonForm.vue";
import PeopleList from "../components/people-view/PeopleList.vue";
import EmptyState from "../components/common/EmptyState.vue";
import memberData from "../assets/animations/member.json";

const groupsStore = useBillGroupsStore();
</script>

<template>
  <div
    class="pb-12"
    v-motion
    :initial="{ opacity: 0, scale: 0.97, y: 15 }"
    :enter="{
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 220, damping: 24 },
    }"
  >
    <AddPersonForm />
    <PeopleList v-if="groupsStore.activePeople.length > 0" />
    <EmptyState
      v-else
      :animation-data="memberData"
      :animation-size="80"
      :animation-margin="'mt-2 mb-4'"
      :title="$t('people.noMembers')"
      :description="$t('people.addFirstMember')"
    />
  </div>
</template>
