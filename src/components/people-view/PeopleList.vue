<script setup>
import { usePeopleStore } from "../../stores/People";
import PersonCard from "./PersonCard.vue";

const peopleStore = usePeopleStore();
</script>

<template>
  <div class="a-card">
    <h2 class="a-header">รายชื่อทั้งหมด</h2>
    <ul class="divide-y divide-neutral-200">
      <PersonCard
        v-for="(person, index) in peopleStore.list"
        :key="index"
        :person="person"
        :index="index"
      />
    </ul>
  </div>
</template>
