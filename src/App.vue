<script setup>
import { ref, computed, onMounted } from "vue";
import PeopleView from "./views/PeopleView.vue";
import BillsView from "./views/BillsView.vue";
import PayerAmountsView from "./views/PayerAmountsView.vue";
import SharedView from "./views/SharedView.vue";
import HomeView from "./views/HomeView.vue";
import { useBillGroupsStore } from "./stores/BillGroups";
import { useBillStore } from "./stores/Bills";

const currentPage = ref("home"); // 'home' | 'group-detail' | 'shared'
const currentView = ref("people");
const groupsStore = useBillGroupsStore();
const billStore = useBillStore();
const isSharedView = ref(false);

import { formatCurrency } from "./utils/common";

const activeGroupColor = computed(() => {
  return groupsStore.activeGroup ? groupsStore.activeGroup.color : '#0066cc';
});

const activeGroupName = computed(() => {
  return groupsStore.activeGroup ? groupsStore.activeGroup.name : '';
});

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('payer_info')) {
    isSharedView.value = true;
    currentPage.value = 'shared';
  }
});

function openGroup(groupId) {
  groupsStore.setActiveGroup(groupId);
  currentView.value = "people";
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
  <div v-if="currentPage === 'shared'" class="min-h-screen bg-neutral-100 flex flex-col animate-fadeIn">
    <main class="flex-grow py-6 pb-24 sm:pb-6">
      <div class="max-w-screen-md mx-auto py-6 px-6">
        <SharedView />
      </div>
    </main>
  </div>

  <!-- Home Page -->
  <div v-else-if="currentPage === 'home'" class="min-h-screen bg-neutral-100 flex flex-col">

    <main class="flex-grow py-6 pb-24 sm:pb-6">
      <div class="max-w-screen-md mx-auto px-4">
        <HomeView @open-group="openGroup" />
      </div>
    </main>
  </div>

  <!-- Group Detail Page -->
  <div v-else-if="currentPage === 'group-detail'" class="min-h-screen bg-neutral-100 flex flex-col">
    <header class="bg-white/90 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-10">
      <div class="max-w-screen-md mx-auto px-4 py-4">
        <!-- Back + Group Name -->
        <div class="flex items-center gap-3 mb-4">
          <button @click="goHome"
            class="p-2 rounded-xl hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 transition-all duration-200 active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
              stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <div class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: activeGroupColor }"></div>
            <h1 class="text-lg font-bold text-neutral-700 truncate">{{ activeGroupName }}</h1>
          </div>
        </div>

        <!-- Total Amount Badge -->
        <div class="flex justify-center">
          <div
            class="a-card bg-gradient-to-b from-neutral-50 to-neutral-100 py-3 px-5 flex items-center w-full sm:w-auto">
            <span class="text-sm text-neutral-500">ยอดรวมทั้งหมด:</span>
            <span class="ml-2 text-xl font-semibold" :style="{ color: activeGroupColor }">{{
              formatCurrency(billStore.totalAmount) }}
              บาท</span>
          </div>
        </div>

        <!-- Tab Navigation (desktop) -->
        <div class="hidden sm:flex justify-center space-x-2 mt-4">
          <button @click="switchView('people')"
            :class="['a-tab', currentView === 'people' ? 'a-tab-active' : 'a-tab-inactive']"
            :style="currentView === 'people' ? { backgroundColor: activeGroupColor } : {}">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="w-5 h-5 mr-1.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              คนจ่าย
            </div>
          </button>

          <button @click="switchView('bills')"
            :class="['a-tab', currentView === 'bills' ? 'a-tab-active' : 'a-tab-inactive']"
            :style="currentView === 'bills' ? { backgroundColor: activeGroupColor } : {}">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="w-5 h-5 mr-1.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M8 6h5a3 3 0 0 1 3 3v.143a2.857 2.857 0 0 1 -2.857 2.857h-5.143z" />
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M8 12h5a3 3 0 0 1 3 3v.143a2.857 2.857 0 0 1 -2.857 2.857h-5.143z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 4v16" />
              </svg>
              บิล
            </div>
          </button>

          <button @click="switchView('payerAmounts')"
            :class="['a-tab', currentView === 'payerAmounts' ? 'a-tab-active' : 'a-tab-inactive']"
            :style="currentView === 'payerAmounts' ? { backgroundColor: activeGroupColor } : {}">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="w-5 h-5 mr-1.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M6.5 5.5C8.5 5.5 8.5 8 8.5 8V9.5M6.5 5.5C4.5 5.5 4.5 8 4.5 8L4.5 9.5H8.5M6.5 5.5C6.5 5.5 15.8 5.5 17.7 5.5C19.5 5.5 19.5 8.5 19.5 8.5V20L17.7 19L15.8 20L14 19L12.2 20L10.3 19L8.5 20V9.5M11 12.5H15M11 9.5H16M11 15.5H16" />
              </svg>
              สรุปยอด
            </div>
          </button>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="flex-grow py-6 pb-24 sm:pb-6">
      <div class="max-w-screen-md mx-auto px-4">
        <div class="transition-all duration-300">
          <div v-if="currentView === 'people'" class="animate-fadeIn">
            <PeopleView />
          </div>
          <div v-else-if="currentView === 'bills'" class="animate-fadeIn">
            <BillsView />
          </div>
          <div v-else-if="currentView === 'payerAmounts'" class="animate-fadeIn">
            <PayerAmountsView />
          </div>
        </div>
      </div>
    </main>

    <!-- Bottom Navigation for Mobile -->
    <div class="sm:hidden fixed bottom-0 inset-x-0 bg-white shadow-a-hover border-t border-neutral-200 py-2 z-10">
      <div class="flex justify-around">
        <button @click="switchView('people')" class="flex flex-col items-center px-4 py-2"
          :class="currentView === 'people' ? '' : 'text-neutral-500'"
          :style="currentView === 'people' ? { color: activeGroupColor } : {}">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          <span class="text-xs mt-1">คนจ่าย</span>
        </button>

        <button @click="switchView('bills')" class="flex flex-col items-center px-4 py-2"
          :class="currentView === 'bills' ? '' : 'text-neutral-500'"
          :style="currentView === 'bills' ? { color: activeGroupColor } : {}">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M8 6h5a3 3 0 0 1 3 3v.143a2.857 2.857 0 0 1 -2.857 2.857h-5.143z" />
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M8 12h5a3 3 0 0 1 3 3v.143a2.857 2.857 0 0 1 -2.857 2.857h-5.143z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 4v16" />
          </svg>
          <span class="text-xs mt-1">บิล</span>
        </button>

        <button @click="switchView('payerAmounts')" class="flex flex-col items-center px-4 py-2"
          :class="currentView === 'payerAmounts' ? '' : 'text-neutral-500'"
          :style="currentView === 'payerAmounts' ? { color: activeGroupColor } : {}">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="w-5 h-5 mr-1.5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M6.5 5.5C8.5 5.5 8.5 8 8.5 8V9.5M6.5 5.5C4.5 5.5 4.5 8 4.5 8L4.5 9.5H8.5M6.5 5.5C6.5 5.5 15.8 5.5 17.7 5.5C19.5 5.5 19.5 8.5 19.5 8.5V20L17.7 19L15.8 20L14 19L12.2 20L10.3 19L8.5 20V9.5M11 12.5H15M11 9.5H16M11 15.5H16" />
          </svg>
          <span class="text-xs mt-1">สรุปยอด</span>
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
