<script setup>
import { useBillGroupsStore } from "../stores/BillGroups";
import AddPersonForm from "../components/people-view/AddPersonForm.vue";
import PeopleList from "../components/people-view/PeopleList.vue";
import EmptyState from "../components/common/EmptyState.vue";

const groupsStore = useBillGroupsStore();
</script>

<template>
  <div class="pb-12 animate-slide-up">
    <AddPersonForm />
    <PeopleList v-if="groupsStore.activePeople.length > 0" />
    <EmptyState
      v-else
      icon="general"
      :title="$t('people.noMembers')"
      :description="$t('people.addFirstMember')"
    />
  </div>
</template>
