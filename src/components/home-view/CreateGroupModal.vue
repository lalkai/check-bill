<script setup>
import { ref } from "vue";
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
  show: { type: Boolean, default: false },
});

const emit = defineEmits(["create", "close"]);

const name = ref("");
const selectedColor = ref(COLOR_PALETTE[0]);
const selectedIcon = ref("general");

function handleCreate() {
  const trimmed = name.value.trim();
  if (!trimmed) return;
  emit("create", trimmed, selectedColor.value, selectedIcon.value);
  name.value = "";
  selectedColor.value = COLOR_PALETTE[0];
  selectedIcon.value = "general";
}

function handleClose() {
  name.value = "";
  selectedColor.value = COLOR_PALETTE[0];
  selectedIcon.value = "general";
  emit("close");
}
</script>

<template>
  <BaseModal
    :show="show"
    :title="$t('group.createNewGroup')"
    @close="handleClose"
  >
    <!-- Name Input -->
    <div>
      <FormLabel>{{ $t("group.groupName") }}</FormLabel>
      <FormInput
        v-model="name"
        :placeholder="$t('group.groupPlaceholder')"
        @keyup.enter="handleCreate"
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
        @click="handleCreate"
        class="w-full"
      >
        {{ $t("actions.create") }}
      </PrimaryButton>
    </template>
  </BaseModal>
</template>
