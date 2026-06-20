<script setup>
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { HugeiconsIcon } from "@hugeicons/vue";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import BaseModal from "../common/BaseModal.vue";
import FormLabel from "../common/FormLabel.vue";
import FormInput from "../common/FormInput.vue";
import PrimaryButton from "../common/PrimaryButton.vue";

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

watch(() => props.show, (val) => {
  if (val && props.promptpayID) {
    inputPromptpay.value = props.promptpayID;
  } else if (val) {
    inputPromptpay.value = "";
  }
});

const handleGenerateQR = () => {
  emit("generate-qr", inputPromptpay.value);
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
      @keyup.enter="handleGenerateQR"
    />

    <template #footer>
      <div class="flex gap-3">
        <PrimaryButton
          :disabled="!inputPromptpay.trim()"
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
