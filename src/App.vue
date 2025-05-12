<script setup>
import { ref } from "vue";
import PeopleView from "./views/PeopleView.vue";
import BillsView from "./views/BillsView.vue";
import PayerAmountsView from "./views/PayerAmountsView.vue";
import { useBillStore } from "./stores/Bills";

const currentView = ref("people");
const billStore = useBillStore();

function switchView(view) {
  currentView.value = view;
}
</script>

<template>
  <div class="min-h-screen bg-neutral-100 flex flex-col">
    <header class="bg-white/90 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-10">
      <div class="max-w-screen-md mx-auto px-4 py-5">
        <div class="flex flex-col items-center space-y-4">
          <div class="a-card bg-gradient-to-b from-neutral-50 to-neutral-100 py-3 px-5 flex items-center w-full sm:w-auto">
            <span class="text-sm text-neutral-500">ยอดรวมทั้งหมด:</span>
            <span class="ml-2 text-xl font-semibold text-neutral-700">{{ billStore.totalAmount }} บาท</span>
          </div>
        </div>
      </div>
    </header>
    
    <!-- Content -->
    <main class="flex-grow py-6 pb-24 sm:pb-6">
      <div class="max-w-screen-md mx-auto px-4">
        <!-- Tab Navigation (desktop) -->
        <div class="hidden sm:flex justify-center space-x-2 mb-8">
          <button
            @click="switchView('people')"
            :class="['a-tab', currentView === 'people' ? 'a-tab-active' : 'a-tab-inactive']"
          >
            <div class="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5 mr-1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
              คนจ่าย
            </div>
          </button>
          
          <button
            @click="switchView('bills')"
            :class="['a-tab', currentView === 'bills' ? 'a-tab-active' : 'a-tab-inactive']"
          >
            <div class="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5 mr-1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              บิล
            </div>
          </button>
          
          <button
            @click="switchView('payerAmounts')"
            :class="['a-tab', currentView === 'payerAmounts' ? 'a-tab-active' : 'a-tab-inactive']"
          >
            <div class="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5 mr-1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Z"
                />
              </svg>
              สรุปยอด
            </div>
          </button>
        </div>
        
        <!-- Views -->
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
        <button 
          @click="switchView('people')" 
          class="flex flex-col items-center px-4 py-2" 
          :class="currentView === 'people' ? 'text-primary' : 'text-neutral-500'"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          <span class="text-xs mt-1">คนจ่าย</span>
        </button>
        
        <button 
          @click="switchView('bills')" 
          class="flex flex-col items-center px-4 py-2" 
          :class="currentView === 'bills' ? 'text-primary' : 'text-neutral-500'"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <span class="text-xs mt-1">บิล</span>
        </button>
        
        <button 
          @click="switchView('payerAmounts')" 
          class="flex flex-col items-center px-4 py-2" 
          :class="currentView === 'payerAmounts' ? 'text-primary' : 'text-neutral-500'"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Z"
            />
          </svg>
          <span class="text-xs mt-1">สรุปยอด</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
</style>
