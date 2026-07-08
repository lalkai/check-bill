import { useScrollLock as useVueUseScrollLock } from "@vueuse/core";
import { watch } from "vue";

/**
 * useScrollLock
 * Locks page scroll when `source` is truthy.
 * Uses VueUse's robust browser scroll lock composable.
 */
export function useScrollLock(source) {
  const isLocked = useVueUseScrollLock(document.body);

  watch(
    source,
    (val) => {
      isLocked.value = !!val;
    },
    { immediate: true },
  );
}
