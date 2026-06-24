<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import BillGroupCard from "../components/home-view/BillGroupCard.vue";
import CreateGroupModal from "../components/home-view/CreateGroupModal.vue";
import EditGroupModal from "../components/home-view/EditGroupModal.vue";
import EmptyState from "../components/common/EmptyState.vue";
import SectionLabel from "../components/common/SectionLabel.vue";
import { useBillGroupsStore } from "../stores/BillGroups";
import { version } from "../../package.json";

const { locale, t: $t } = useI18n();
const groupsStore = useBillGroupsStore();
const emit = defineEmits(["open-group"]);

import BaseModal from "../components/common/BaseModal.vue";
import { formatCurrency } from "../utils/common";
import { applyGroupTheme } from "../utils/theme";
import { HugeiconsIcon } from "@hugeicons/vue";
import {
  Wallet01Icon,
  Add01Icon,
  Settings01Icon,
  Moon01Icon,
  Sun01Icon,
  TranslationIcon,
} from "@hugeicons/core-free-icons";

const showCreateModal = ref(false);
const showSettingsModal = ref(false);
const editingGroup = ref(null);

const isDarkMode = ref(document.documentElement.classList.contains("dark"));

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value;
  if (isDarkMode.value) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
  applyGroupTheme();
}

function setLanguage(lang) {
  locale.value = lang;
  localStorage.setItem("lang", lang);
}

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
  <div class="space-y-8 pb-8 animate-slide-up">
    <!-- Dashboard Summary -->
    <div
      class="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4 sm:grid sm:grid-cols-2 sm:mx-0 sm:px-0 sm:overflow-visible"
    >
      <div
        class="min-w-[85%] sm:min-w-0 snap-center bg-gradient-to-br from-primary to-primary-light text-white rounded-[2.5rem] p-8 shadow-primary/30 flex flex-col justify-center border border-white/10 relative overflow-hidden"
      >
        <div
          class="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"
        ></div>
        <div
          class="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-black/10 blur-xl"
        ></div>

        <div
          class="flex items-center gap-2 text-white/80 text-[10px] font-black uppercase tracking-[0.15em] mb-2 relative z-10"
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
          class="text-neutral-400 text-[10px] font-black uppercase tracking-[0.15em] mb-2"
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
        <SectionLabel class="ml-2">{{ $t("home.billGroups") }}</SectionLabel>
        <div class="flex items-center gap-2">
          <button
            @click="showCreateModal = true"
            class="text-[11px] font-black text-primary hover:text-primary-dark transition-colors uppercase tracking-wider bg-primary/10 px-4 py-2 rounded-xl flex items-center gap-1.5 active:scale-95"
          >
            <HugeiconsIcon :icon="Add01Icon" size="14" :stroke-width="3" />
            {{ $t("home.newGroup") }}
          </button>
          <!-- Settings Button -->
          <button
            @click="showSettingsModal = true"
            class="text-neutral-600 dark:text-neutral-300 transition-colors bg-neutral-100 dark:bg-neutral-800 p-2.5 rounded-xl flex items-center justify-center active:scale-95 border border-neutral-200 dark:border-neutral-700/50"
          >
            <HugeiconsIcon
              :icon="Settings01Icon"
              size="15"
              :stroke-width="2.5"
            />
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <EmptyState
        v-if="groupsStore.groups.length === 0"
        icon="general"
        :title="$t('home.noGroups')"
        :description="$t('home.startTracking')"
        :action-label="$t('home.createGroup')"
        @action="showCreateModal = true"
      />

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
    <BaseModal
      :show="showSettingsModal"
      :title="$t('settings.title')"
      maxWidth="max-w-xs"
      @close="showSettingsModal = false"
    >
      <div class="space-y-6 py-2">
        <!-- Dark Mode Section -->
        <div class="flex items-center justify-between">
          <span class="text-sm font-black text-neutral-700 dark:text-neutral-300 tracking-tight flex items-center gap-2">
            <HugeiconsIcon
              :icon="isDarkMode ? Moon01Icon : Sun01Icon"
              size="18"
              class="text-neutral-500"
            />
            {{ $t("settings.darkMode") }}
          </span>
          <button
            @click="toggleDarkMode"
            class="w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 cursor-pointer"
            :class="isDarkMode ? 'bg-primary justify-end' : 'bg-neutral-200 dark:bg-neutral-700 justify-start'"
          >
            <span class="bg-white w-4 h-4 rounded-full shadow-md transition-all duration-300"></span>
          </button>
        </div>

        <!-- Language Section -->
        <div class="space-y-3">
          <label class="block text-[10px] font-black text-neutral-400 uppercase tracking-widest">
            {{ $t("settings.language") }}
          </label>
          <div class="grid grid-cols-2 gap-2 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50 language-select-group">
            <button
              @click="setLanguage('th')"
              class="py-2.5 px-3 rounded-xl font-bold text-xs transition-all tracking-wider text-center"
              :class="locale === 'th' ? 'bg-white dark:bg-neutral-700 text-primary dark:text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400'"
            >
              ไทย (TH)
            </button>
            <button
              @click="setLanguage('en')"
              class="py-2.5 px-3 rounded-xl font-bold text-xs transition-all tracking-wider text-center"
              :class="locale === 'en' ? 'bg-white dark:bg-neutral-700 text-primary dark:text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400'"
            >
              English (EN)
            </button>
          </div>
        </div>

        <!-- Version -->
        <div class="text-center pt-2 border-t border-neutral-100 dark:border-neutral-700/50">
          <p class="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
            {{ $t("settings.version") }} v{{ version }}
          </p>
        </div>
      </div>
    </BaseModal>
  </div>
</template>
