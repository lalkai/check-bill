<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { applyGroupTheme } from "./utils/theme";

const { t: $t } = useI18n();
import PeopleView from "./views/PeopleView.vue";
import BillsView from "./views/BillsView.vue";
import PayerAmountsView from "./views/PayerAmountsView.vue";
import DashboardView from "./views/DashboardView.vue";
import SharedView from "./views/SharedView.vue";
import HomeView from "./views/HomeView.vue";
import { useBillGroupsStore } from "./stores/BillGroups";

const currentPage = ref("home"); // 'home' | 'group-detail' | 'shared'
const currentView = ref("dashboard");
const groupsStore = useBillGroupsStore();
const isSharedView = ref(false);
import { HugeiconsIcon } from "@hugeicons/vue";
import {
  ArrowLeft01Icon,
  DashboardSquare01Icon,
  Invoice01Icon,
  Wallet01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";

const activeGroupColor = computed(() => {
  return groupsStore.activeGroup ? groupsStore.activeGroup.color : "#0066cc";
});

const activeGroupName = computed(() => {
  return groupsStore.activeGroup ? groupsStore.activeGroup.name : "";
});

watch(
  activeGroupColor,
  (newColor) => {
    applyGroupTheme(newColor);
  },
  { immediate: true },
);

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("payer_info")) {
    isSharedView.value = true;
    currentPage.value = "shared";
  }
});

function openGroup(groupId) {
  groupsStore.setActiveGroup(groupId);
  currentView.value = "dashboard";
  currentPage.value = "group-detail";
}

function goHome() {
  groupsStore.setActiveGroup(null);
  currentPage.value = "home";
}

function switchView(view) {
  currentView.value = view;
}
</script>

<template>
  <!-- Shared View (standalone) -->
  <div
    v-if="currentPage === 'shared'"
    class="min-h-screen bg-surface flex flex-col animate-slide-up"
  >
    <main class="flex-grow py-6 pb-24 sm:pb-6">
      <div class="max-w-screen-md mx-auto py-6 px-6">
        <SharedView />
      </div>
    </main>
  </div>

  <!-- Home Page -->
  <div
    v-else-if="currentPage === 'home'"
    class="min-h-screen bg-surface flex flex-col"
  >
    <main class="flex-grow py-6 pb-24 sm:pb-6">
      <div class="max-w-screen-md mx-auto px-4">
        <HomeView @open-group="openGroup" />
      </div>
    </main>
  </div>

  <!-- Group Detail Page -->
  <div
    v-else-if="currentPage === 'group-detail'"
    class="min-h-screen bg-surface flex flex-col"
  >
    <header class="bg-white border-b border-neutral-100 sticky top-0 z-20">
      <div
        class="max-w-screen-md mx-auto px-6 py-4 flex items-center justify-between"
      >
        <div class="flex items-center gap-4">
          <button
            @click="goHome"
            class="p-2 -ml-2 rounded-2xl hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-all active:scale-90 flex items-center justify-center"
          >
            <HugeiconsIcon :icon="ArrowLeft01Icon" size="20" :stroke-width="3" />
          </button>
          <h1
            class="text-sm font-black text-neutral-700 uppercase tracking-widest truncate max-w-[200px]"
          >
            {{ activeGroupName }}
          </h1>
        </div>

        <!-- Desktop Nav -->
        <div class="hidden sm:flex items-center gap-2">
          <button
            v-for="view in ['dashboard', 'bills', 'payerAmounts', 'people']"
            :key="view"
            @click="switchView(view)"
            class="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            :class="
              currentView === view
                ? 'bg-primary text-white shadow-md'
                : 'text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600'
            "
          >
            {{
              view === "dashboard"
                ? $t("nav.dashboard")
                : view === "bills"
                ? $t("nav.activity")
                : view === "payerAmounts"
                ? $t("nav.settle")
                : $t("nav.people")
            }}
          </button>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="flex-grow py-8 pb-32">
      <div class="max-w-screen-md mx-auto px-6">
        <Transition name="fade" mode="out-in">
          <div :key="currentView">
            <DashboardView v-if="currentView === 'dashboard'" />
            <BillsView v-else-if="currentView === 'bills'" />
            <PeopleView v-else-if="currentView === 'people'" />
            <PayerAmountsView v-else-if="currentView === 'payerAmounts'" />
          </div>
        </Transition>
      </div>
    </main>

    <!-- Sticky Bottom Navigation -->
    <div
      class="fixed bottom-0 inset-x-0 h-36 bg-gradient-to-t from-white/60 to-transparent backdrop-blur-sm z-20 pointer-events-none sm:hidden"
      style="mask-image: linear-gradient(to top, black 30%, transparent 100%)"
    ></div>

    <div class="fixed bottom-6 inset-x-0 z-30 px-4 sm:hidden">
      <div
        class="max-w-md mx-auto bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-neutral-100 rounded-[2.5rem] p-1.5 flex justify-around items-center"
      >
        <button
          @click="switchView('dashboard')"
          class="flex-1 flex flex-col items-center gap-0.5 py-3 rounded-[2rem] transition-all min-w-0"
          :class="
            currentView === 'dashboard'
              ? 'bg-primary text-white shadow-lg scale-105 px-2'
              : 'text-neutral-400 px-1'
          "
        >
          <HugeiconsIcon :icon="DashboardSquare01Icon" size="24" />
          <span
            class="text-[9px] font-black uppercase tracking-widest truncate w-full text-center"
            >{{ $t("nav.dashboard") }}</span
          >
        </button>

        <button
          @click="switchView('bills')"
          class="flex-1 flex flex-col items-center gap-0.5 py-3 rounded-[2rem] transition-all min-w-0"
          :class="
            currentView === 'bills'
              ? 'bg-primary text-white shadow-lg scale-105 px-2'
              : 'text-neutral-400 px-1'
          "
        >
          <HugeiconsIcon :icon="Invoice01Icon" size="24" />
          <span
            class="text-[9px] font-black uppercase tracking-widest truncate w-full text-center"
            >{{ $t("nav.activity") }}</span
          >
        </button>

        <button
          @click="switchView('payerAmounts')"
          class="flex-1 flex flex-col items-center gap-0.5 py-3 rounded-[2rem] transition-all min-w-0"
          :class="
            currentView === 'payerAmounts'
              ? 'bg-primary text-white shadow-lg scale-105 px-2'
              : 'text-neutral-400 px-1'
          "
        >
          <HugeiconsIcon :icon="Wallet01Icon" size="24" />
          <span
            class="text-[9px] font-black uppercase tracking-widest truncate w-full text-center"
            >{{ $t("nav.settle") }}</span
          >
        </button>

        <button
          @click="switchView('people')"
          class="flex-1 flex flex-col items-center gap-0.5 py-3 rounded-[2rem] transition-all min-w-0"
          :class="
            currentView === 'people'
              ? 'bg-primary text-white shadow-lg scale-105 px-2'
              : 'text-neutral-400 px-1'
          "
        >
          <HugeiconsIcon :icon="UserIcon" size="24" />
          <span
            class="text-[9px] font-black uppercase tracking-widest truncate w-full text-center"
            >{{ $t("nav.people") }}</span
          >
        </button>
      </div>
    </div>
  </div>
</template>
