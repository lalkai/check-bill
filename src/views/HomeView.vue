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
import { HugeiconsIcon } from "@hugeicons/vue";
import {
  Wallet01Icon,
  Add01Icon,
  TranslationIcon,
  FolderFavouriteIcon,
} from "@hugeicons/core-free-icons";

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
          <HugeiconsIcon :icon="Wallet01Icon" size="16" />
          {{ $t("dashboard.totalAllGroups") }}
        </div>
        <div
          class="flex items-baseline min-w-0 text-3xl sm:text-4xl relative z-10 overflow-hidden"
        >
          <span class="text-xl sm:text-2xl opacity-80 mr-1 flex-shrink-0"
            >฿</span
          ><span class="font-black tracking-tight truncate">{{
            formatCurrency(groupsStore.totalAllGroupsAmount)
          }}</span>
        </div>
      </div>

      <div
        class="min-w-[85%] sm:min-w-0 snap-center bg-white rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100/50 flex flex-col justify-center min-w-0"
      >
        <div
          class="text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2"
        >
          {{ $t("dashboard.totalGroups") }}
        </div>
        <div
          class="text-3xl sm:text-4xl font-black text-neutral-700 tracking-tight flex items-baseline gap-2 truncate"
        >
          {{ groupsStore.groups.length }}
          <span
            class="text-xs sm:text-sm font-bold text-neutral-400 uppercase tracking-widest flex-shrink-0"
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
            <HugeiconsIcon :icon="Add01Icon" size="14" stroke-width="3" />
            {{ $t("home.newGroup") }}
          </button>
          <!-- Language Toggle -->
          <button
            @click="toggleLanguage"
            class="text-[10px] font-black text-neutral-600 transition-colors uppercase tracking-[0.1em] bg-neutral-100 px-3 py-2 rounded-xl flex items-center gap-1.5 active:scale-95 border border-neutral-200"
          >
            <HugeiconsIcon
              :icon="TranslationIcon"
              size="14"
              stroke-width="2.5"
            />
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
          <HugeiconsIcon
            :icon="FolderFavouriteIcon"
            size="40"
            class="text-neutral-300"
          />
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
          <HugeiconsIcon :icon="Add01Icon" size="16" stroke-width="3" />
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
