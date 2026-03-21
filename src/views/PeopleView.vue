<script setup>
import { usePeopleStore } from "../stores/People";
import AddPersonForm from "../components/people-view/AddPersonForm.vue";
import PeopleList from "../components/people-view/PeopleList.vue";
import EmptyPeopleState from "../components/people-view/EmptyPeopleState.vue";

const peopleStore = usePeopleStore();
</script>

<template>
  <div class="pb-12">
    <AddPersonForm />
    <PeopleList v-if="peopleStore.list.length > 0" />
    <EmptyPeopleState v-else />
  </div>
</template>
