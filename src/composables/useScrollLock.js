import { watch, onUnmounted } from "vue";

/**
 * useScrollLock
 * Locks page scroll when `source` is truthy.
 * Combines overflow:hidden + position:fixed (desktop) + touchmove block (iOS Safari).
 */
export function useScrollLock(source) {
  let scrollY = 0;
  let locked = false;

  const prevent = (e) => {
    // Allow scrolling inside the modal itself (target inside .modal-scroll-inner)
    if (e.target.closest?.("[data-scroll-inner]")) return;
    e.preventDefault();
  };

  const lock = () => {
    if (locked) return;
    locked = true;
    scrollY = window.scrollY;

    // Desktop: hide overflow on both html and body
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    // iOS Safari fallback: position fixed
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    // Block touchmove (non-passive so preventDefault works)
    document.addEventListener("touchmove", prevent, { passive: false });
  };

  const unlock = () => {
    if (!locked) return;
    locked = false;

    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";

    document.removeEventListener("touchmove", prevent);
    window.scrollTo({ top: scrollY, behavior: "instant" });
  };

  watch(source, (val) => { val ? lock() : unlock(); }, { immediate: true });

  onUnmounted(unlock);
}
