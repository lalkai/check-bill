<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import BillGroupCard from "../components/home-view/BillGroupCard.vue";
import CreateGroupModal from "../components/home-view/CreateGroupModal.vue";
import EditGroupModal from "../components/home-view/EditGroupModal.vue";
import { useBillGroupsStore } from "../stores/BillGroups";

const { locale, t: $t } = useI18n();
const groupsStore = useBillGroupsStore();
const emit = defineEmits(["open-group"]);

const currentLocale = computed(() => locale.value.toUpperCase());

function toggleLanguage() {
  locale.value = locale.value === "en" ? "th" : "en";
  localStorage.setItem("lang", locale.value);
}

import { formatCurrency } from "../utils/common";

const showCreateModal = ref(false);
const editingGroup = ref(null);

function handleCreateGroup(name, color) {
  groupsStore.addGroup(name, color);
  showCreateModal.value = false;
}

function handleOpenGroup(group) {
  emit("open-group", group.id);
}

function handleEditGroup(group) {
  editingGroup.value = { ...group };
}

function handleSaveEdit(groupId, updates) {
  groupsStore.updateGroup(groupId, updates);
  editingGroup.value = null;
}

function handleDeleteGroup(groupId) {
  if (confirm($t("actions.confirmDelete"))) {
    groupsStore.removeGroup(groupId);
  }
}
</script>

<template>
  <div class="space-y-8 pb-8">
    <!-- Dashboard Summary -->
    <div
      class="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4 sm:grid sm:grid-cols-2 sm:mx-0 sm:px-0 sm:overflow-visible"
    >
      <div
        class="min-w-[85%] sm:min-w-0 snap-center bg-gradient-to-br from-primary to-primary-light text-white rounded-[2.5rem] p-8 shadow-[0_12px_40px_rgba(0,102,204,0.3)] flex flex-col justify-center border border-white/10 relative overflow-hidden"
      >
        <div
          class="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"
        ></div>
        <div
          class="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-black/10 blur-xl"
        ></div>

        <div
          class="flex items-center gap-2 text-white/80 text-[10px] font-black uppercase tracking-[0.2em] mb-2 relative z-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2.5"
            stroke="currentColor"
            class="w-4 h-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
            />
          </svg>
          {{ $t("dashboard.totalAllGroups") }}
        </div>
        <div
          class="flex items-baseline overflow-x-auto scrollbar-hide whitespace-nowrap min-w-0 text-4xl relative z-10"
        >
          <span class="text-2xl opacity-80 mr-1">฿</span
          ><span class="font-black tracking-tight">{{
            formatCurrency(groupsStore.totalAllGroupsAmount)
          }}</span>
        </div>
      </div>

      <div
        class="min-w-[85%] sm:min-w-0 snap-center bg-white rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100/50 flex flex-col justify-center"
      >
        <div
          class="text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2"
        >
          {{ $t("dashboard.totalGroups") }}
        </div>
        <div
          class="text-4xl font-black text-neutral-700 overflow-hidden break-all tracking-tight flex items-baseline gap-2"
        >
          {{ groupsStore.groups.length }}
          <span
            class="text-sm font-bold text-neutral-400 uppercase tracking-widest"
            >{{ $t("dashboard.groupsLabel") }}</span
          >
        </div>
      </div>
    </div>

    <!-- Groups Section -->
    <section>
      <div class="flex items-center justify-between mb-6">
        <h2
          class="text-[11px] font-black text-neutral-400 uppercase tracking-[0.15em] ml-2"
        >
          {{ $t("home.billGroups") }}
        </h2>
        <div class="flex items-center gap-2">
          <button
            @click="showCreateModal = true"
            class="text-[11px] font-black text-primary hover:text-primary-dark transition-colors uppercase tracking-wider bg-primary/10 px-4 py-2 rounded-xl flex items-center gap-1.5 active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="3"
              stroke="currentColor"
              class="w-3.5 h-3.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            {{ $t("home.newGroup") }}
          </button>
          <!-- Language Toggle -->
          <button
            @click="toggleLanguage"
            class="text-[10px] font-black text-neutral-400 hover:text-neutral-600 transition-colors uppercase tracking-[0.1em] bg-neutral-100 px-3 py-2 rounded-xl flex items-center gap-1.5 active:scale-95 border border-neutral-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2.5"
              stroke="currentColor"
              class="w-3.5 h-3.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802"
              />
            </svg>
            {{ currentLocale }}
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="groupsStore.groups.length === 0"
        class="bg-white rounded-[2.5rem] p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100/50 flex flex-col items-center"
      >
        <div
          class="w-20 h-20 mx-auto rounded-[1.5rem] bg-neutral-50 flex items-center justify-center border border-neutral-100 mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-10 h-10 text-neutral-300"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </div>
        <h3 class="text-neutral-700 font-black text-lg mb-2">
          {{ $t("home.noGroups") }}
        </h3>
        <p class="text-neutral-400 text-sm font-medium mb-8 max-w-xs">
          {{ $t("home.startTracking") }}
        </p>
        <button
          @click="showCreateModal = true"
          class="bg-neutral-800 text-white font-black text-[11px] uppercase tracking-widest py-4 px-8 rounded-2xl hover:bg-neutral-900 transition-all active:scale-95 shadow-lg inline-flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="3"
            stroke="currentColor"
            class="w-4 h-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          {{ $t("home.createGroup") }}
        </button>
      </div>

      <!-- Groups List -->
      <div v-else class="space-y-4">
        <BillGroupCard
          v-for="group in groupsStore.groups"
          :key="group.id"
          :group="group"
          :billCount="groupsStore.getGroupBillCount(group.id)"
          :peopleCount="groupsStore.getGroupPeopleCount(group.id)"
          :totalAmount="groupsStore.getGroupTotalAmount(group.id)"
          @click="handleOpenGroup(group)"
          @edit="handleEditGroup(group)"
          @delete="handleDeleteGroup(group.id)"
        />
      </div>
    </section>

    <!-- Modals -->
    <CreateGroupModal
      :show="showCreateModal"
      @create="handleCreateGroup"
      @close="showCreateModal = false"
    />
    <EditGroupModal
      :group="editingGroup"
      @save="handleSaveEdit"
      @close="editingGroup = null"
    />
  </div>
</template>
