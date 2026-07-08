<script setup>
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { COLOR_PALETTE } from "../../stores/BillGroups";
import BaseModal from "../common/BaseModal.vue";
import FormLabel from "../common/FormLabel.vue";
import FormInput from "../common/FormInput.vue";
import PrimaryButton from "../common/PrimaryButton.vue";
import ColorPicker from "../common/ColorPicker.vue";
import IconPicker from "../common/IconPicker.vue";

const { t: $t } = useI18n();
const props = defineProps({
  group: { type: Object, default: null },
});

const emit = defineEmits(["save", "close"]);

const name = ref("");
const selectedColor = ref(COLOR_PALETTE[0]);
const selectedIcon = ref("general");

watch(
  () => props.group,
  (newGroup) => {
    if (newGroup) {
      name.value = newGroup.name || "";
      selectedColor.value = newGroup.color || COLOR_PALETTE[0];
      selectedIcon.value = newGroup.icon || "general";
    }
  },
  { immediate: true },
);

function handleSave() {
  const trimmed = name.value.trim();
  if (!trimmed || !props.group) return;
  emit("save", props.group.id, {
    name: trimmed,
    color: selectedColor.value,
    icon: selectedIcon.value,
  });
}
</script>

<template>
  <BaseModal
    :show="!!group"
    :title="$t('group.editGroup')"
    @close="emit('close')"
  >
    <!-- Name Input -->
    <div>
      <FormLabel>{{ $t("group.groupName") }}</FormLabel>
      <FormInput
        v-model="name"
        :placeholder="$t('group.groupPlaceholder')"
        @keyup.enter="handleSave"
      />
    </div>

    <!-- Color Picker -->
    <div>
      <FormLabel>{{ $t("group.selectColor") }}</FormLabel>
      <ColorPicker v-model="selectedColor" />
    </div>

    <!-- Icon Picker -->
    <div>
      <FormLabel>{{ $t("group.selectIcon") }}</FormLabel>
      <IconPicker v-model="selectedIcon" layout="grid" />
    </div>

    <template #footer>
      <PrimaryButton
        :disabled="!name.trim()"
        @click="handleSave"
        class="w-full"
      >
        {{ $t("actions.save") }}
      </PrimaryButton>
    </template>
  </BaseModal>
</template>
