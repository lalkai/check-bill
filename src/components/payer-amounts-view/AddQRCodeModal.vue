<script setup>
import { ref, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import { HugeiconsIcon } from "@hugeicons/vue";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import BaseModal from "../common/BaseModal.vue";
import FormLabel from "../common/FormLabel.vue";
import FormInput from "../common/FormInput.vue";
import PrimaryButton from "../common/PrimaryButton.vue";
import { cleanPromptpayID, validatePromptpayID } from "../../utils/common";

const { t: $t } = useI18n();

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  promptpayID: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["generate-qr", "delete-qr", "close"]);

const inputPromptpay = ref("");

const isValid = computed(() => {
  if (!inputPromptpay.value.trim()) return true;
  return validatePromptpayID(inputPromptpay.value);
});

watch(() => props.show, (val) => {
  if (val && props.promptpayID) {
    inputPromptpay.value = props.promptpayID;
  } else if (val) {
    inputPromptpay.value = "";
  }
});

const handleGenerateQR = () => {
  if (isValid.value && inputPromptpay.value.trim()) {
    const cleaned = cleanPromptpayID(inputPromptpay.value);
    emit("generate-qr", cleaned);
  }
};

const handleDeleteQR = () => {
  emit("delete-qr");
};
</script>

<template>
  <BaseModal
    :show="show"
    :title="$t('qr.addTitle')"
    @close="emit('close')"
  >
    <FormLabel for="promptpay-input">{{ $t("qr.promptpayId") }}</FormLabel>
    <FormInput
      id="promptpay-input"
      v-model="inputPromptpay"
      :placeholder="$t('qr.promptpayPlaceholder')"
      :class="{ '!border-red-400 focus:!border-red-500 focus:!ring-red-100/50': !isValid }"
      @keyup.enter="handleGenerateQR"
    />
    <p v-if="!isValid" class="text-xs text-red-500 mt-2 font-bold pl-1">
      {{ $t("qr.invalidId") }}
    </p>

    <template #footer>
      <div class="flex gap-3">
        <PrimaryButton
          :disabled="!inputPromptpay.trim() || !isValid"
          @click="handleGenerateQR"
          class="flex-1"
        >
          {{ $t("qr.generate") }}
        </PrimaryButton>
        <PrimaryButton
          v-if="promptpayID"
          variant="danger"
          @click="handleDeleteQR"
        >
          <HugeiconsIcon :icon="Delete02Icon" size="15" :stroke-width="2.5" />
          {{ $t("tools.delQr") }}
        </PrimaryButton>
      </div>
    </template>
  </BaseModal>
</template>

