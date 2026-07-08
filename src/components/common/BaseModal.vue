<script setup>
import { computed } from "vue";
import { useScrollLock } from "../../composables/useScrollLock";
import { handleFocusIn } from "../../utils/common";
import CloseButton from "./CloseButton.vue";

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: "" },
  maxWidth: { type: String, default: "max-w-md" },
  noPadding: { type: Boolean, default: false },
});

const emit = defineEmits(["close"]);
useScrollLock(computed(() => props.show));
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-end justify-center p-3 sm:p-4 sm:items-center"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-sm"
          @click="emit('close')"
        ></div>

        <!-- Modal -->
        <div
          class="relative bg-white rounded-[2.2rem] sm:rounded-[2.5rem] shadow-[0_24px_60px_rgba(0,0,0,0.18)] w-full border border-white/20 max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
          :class="maxWidth"
          @focusin="handleFocusIn"
        >
          <!-- Header -->
          <div
            v-if="title || $slots.header"
            class="px-8 pt-8 pb-5 flex justify-between items-center border-b border-neutral-100 flex-shrink-0"
          >
            <slot name="header">
              <h2 class="text-2xl font-black text-neutral-800 tracking-tight">
                {{ title }}
              </h2>
            </slot>
            <CloseButton @click="emit('close')" />
          </div>

          <!-- Scrollable body -->
          <div
            data-scroll-inner
            class="flex-1 overflow-y-auto scrollbar-hide"
            :class="noPadding ? '' : 'px-8 py-6 space-y-6'"
          >
            <slot />
          </div>

          <!-- Sticky footer -->
          <div
            v-if="$slots.footer"
            class="px-8 py-5 border-t border-neutral-100 bg-white flex-shrink-0"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
