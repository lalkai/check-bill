import { computed } from "vue";
import { useBillGroupsStore } from "../stores/BillGroups";
import { hexToRgb } from "../utils/theme";

export function useGroupColor() {
  const groupsStore = useBillGroupsStore();

  const groupColor = computed(() => groupsStore.activeGroup?.color || "#0066cc");
  const groupColorRgb = computed(() => hexToRgb(groupColor.value));

  const getAvatarStyle = (payer) => {
    if (payer?.isOwner) {
      return { backgroundColor: "#f59e0b" };
    }
    return { backgroundColor: groupColor.value };
  };

  const getButtonStyle = (opacity = 0.2) => ({
    backgroundColor: groupColor.value,
    boxShadow: `0 2px 8px rgba(${groupColorRgb.value.r}, ${groupColorRgb.value.g}, ${groupColorRgb.value.b}, ${opacity})`,
  });

  return {
    groupColor,
    groupColorRgb,
    getAvatarStyle,
    getButtonStyle,
  };
}
