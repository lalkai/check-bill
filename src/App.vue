<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { t: $t } = useI18n();
import PeopleView from "./views/PeopleView.vue";
import BillsView from "./views/BillsView.vue";
import PayerAmountsView from "./views/PayerAmountsView.vue";
import DashboardView from "./views/DashboardView.vue";
import SharedView from "./views/SharedView.vue";
import HomeView from "./views/HomeView.vue";
import { useBillGroupsStore } from "./stores/BillGroups";
import { useBillStore } from "./stores/Bills";

const currentPage = ref("home"); // 'home' | 'group-detail' | 'shared'
const currentView = ref("dashboard");
const groupsStore = useBillGroupsStore();
const billStore = useBillStore();
const isSharedView = ref(false);

import { formatCurrency } from "./utils/common";

const activeGroupColor = computed(() => {
  return groupsStore.activeGroup ? groupsStore.activeGroup.color : "#0066cc";
});

const activeGroupName = computed(() => {
  return groupsStore.activeGroup ? groupsStore.activeGroup.name : "";
});

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
    class="min-h-screen bg-[#f8f9fb] flex flex-col animate-fadeIn"
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
    class="min-h-screen bg-[#f8f9fb] flex flex-col"
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
    class="min-h-screen bg-[#f8f9fb] flex flex-col"
  >
    <!-- Redesigned Header for Mobile is now inside DashboardView, 
         but we keep a minimal sticky top bar for back navigation -->
    <header class="bg-white border-b border-neutral-100 sticky top-0 z-20">
      <div
        class="max-w-screen-md mx-auto px-6 py-4 flex items-center justify-between"
      >
        <div class="flex items-center gap-4">
          <button
            @click="goHome"
            class="p-2 -ml-2 rounded-2xl hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-all active:scale-90"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="3"
              stroke="currentColor"
              class="w-5 h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
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
                : $t("nav.settings")
            }}
          </button>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="flex-grow py-8 pb-32">
      <div class="max-w-screen-md mx-auto px-6">
        <div class="transition-all duration-300">
          <div v-if="currentView === 'dashboard'" class="animate-fadeIn">
            <DashboardView />
          </div>
          <div v-else-if="currentView === 'bills'" class="animate-fadeIn">
            <BillsView />
          </div>
          <div v-else-if="currentView === 'people'" class="animate-fadeIn">
            <PeopleView />
          </div>
          <div
            v-else-if="currentView === 'payerAmounts'"
            class="animate-fadeIn"
          >
            <PayerAmountsView />
          </div>
        </div>
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-6 h-6"
          >
            <path
              d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.69Z"
            />
            <path
              d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75-.75V21a.75.75 0 0 1-.75-.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z"
            />
          </svg>
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-6 h-6"
          >
            <path
              fill-rule="evenodd"
              d="M4.125 3C3.089 3 2.25 3.84 2.25 4.875V18a3 3 0 0 0 3 3h15a3 3 0 0 1-3-3V4.875C17.25 3.839 16.41 3 15.375 3H4.125ZM12 9.75a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H12Zm-.75-2.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5H12a.75.75 0 0 1-.75-.75ZM12 12.75a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H12Z"
              clip-rule="evenodd"
            />
            <path
              d="M2.25 18.75a3 3 0 0 1 3-3h15a3 3 0 0 1-3 3v.375c0 .621-.504 1.125-1.125 1.125h-12.75c-.621 0-1.125-.504-1.125-1.125v-.375Z"
            />
          </svg>
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-6 h-6"
          >
            <path
              fill-rule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM9 7.5A.75.75 0 0 0 9 9h6a.75.75 0 0 0 0-1.5H9Zm-1.5 4.5a.75.75 0 0 0 .75.75h9a.75.75 0 0 0 0-1.5h-9a.75.75 0 0 0-.75.75Zm3 4.5a.75.75 0 0 0 .75.75h3a.75.75 0 0 0 0-1.5h-3a.75.75 0 0 0-.75.75Z"
              clip-rule="evenodd"
            />
          </svg>
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-6 h-6"
          >
            <path
              fill-rule="evenodd"
              d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.349l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.844ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
              clip-rule="evenodd"
            />
          </svg>
          <span
            class="text-[9px] font-black uppercase tracking-widest truncate w-full text-center"
            >{{ $t("nav.settings") }}</span
          >
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
</style>
