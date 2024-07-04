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
  <div class="flex justify-center min-h-screen bg-gray-20">
    <div
      class="w-full px-4 py-6 max-w-screen-sm bg-base-300 shadow-md rounded-lg"
    >
      <div>
        <h2 class="text-xl font-bold mb-4 text-right">
          ยอดรวมทั้งหมด: {{ billStore.totalAmount }} บาท
        </h2>
      </div>
      <div class="flex justify-end space-x-2 mt-4">
        <button
          @click="switchView('people')"
          :class="[
            'btn',
            'text-sm',
            currentView === 'people' ? 'btn-active' : 'btn-outline',
          ]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          คนจ่าย
        </button>
        <button
          @click="switchView('bills')"
          :class="[
            'btn',
            'text-sm',
            currentView === 'bills' ? 'btn-active' : 'btn-outline',
          ]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>

          บิล
        </button>
        <button
          @click="switchView('payerAmounts')"
          :class="[
            'btn',
            'text-sm',
            currentView === 'payerAmounts' ? 'btn-active' : 'btn-outline',
          ]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z"
            />
          </svg>

          สรุปยอด
        </button>
      </div>
      <div v-if="currentView === 'people'">
        <div class="mt-4">
          <PeopleView />
        </div>
      </div>
      <div v-else-if="currentView === 'bills'">
        <BillsView />
      </div>

      <div v-else-if="currentView === 'payerAmounts'">
        <PayerAmountsView />
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn {
  @apply py-3 px-6 rounded-full transition-colors text-black bg-base-100;
  font-size: 16px;
}

.btn-active {
  @apply bg-black text-white;
}

@media (max-width: 768px) {
  .btn {
    @apply py-2 px-4;
    font-size: 14px;
  }
}
</style>
