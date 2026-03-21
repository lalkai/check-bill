<script setup>
defineEmits(["show-qr-popup", "delete-qr", "share-payer"]);
</script>

<template>
  <div
    class="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100/50 mb-8"
  >
    <h2
      class="text-[10px] sm:text-[11px] font-black text-neutral-400 uppercase tracking-[0.15em] mb-4"
    >
      {{ $t("tools.title") }}
    </h2>
    <div class="grid grid-cols-2 sm:flex sm:flex-row gap-3 sm:gap-4">
      <button
        @click="$emit('show-qr-popup')"
        class="flex sm:flex-1 bg-neutral-50 text-neutral-600 font-black text-[10px] sm:text-[11px] uppercase tracking-widest py-3.5 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl hover:bg-neutral-100 border border-neutral-200 transition-all active:scale-95 items-center justify-center gap-2"
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
            d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"
          />
        </svg>
        <span>{{ $t("tools.pay") }}</span>
      </button>

      <button
        @click="$emit('delete-qr')"
        class="flex sm:flex-1 bg-red-50 text-red-500 font-black text-[10px] sm:text-[11px] uppercase tracking-widest py-3.5 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl hover:bg-red-100 border border-red-200 transition-all active:scale-95 items-center justify-center gap-2"
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
            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
          />
        </svg>
        <span>{{ $t("tools.delQr") }}</span>
      </button>

      <button
        @click="$emit('share-payer')"
        class="col-span-2 sm:flex-1 bg-neutral-900 text-white font-black text-[10px] sm:text-[11px] uppercase tracking-widest py-4 px-6 rounded-xl sm:rounded-2xl hover:bg-black transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
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
            d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
          />
        </svg>
        {{ $t("tools.shareBill") }}
      </button>
    </div>
  </div>
</template>
