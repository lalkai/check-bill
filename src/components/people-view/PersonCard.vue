<script setup>
import { computed } from "vue";
import { useBillGroupsStore } from "../../stores/BillGroups";
import { useI18n } from "vue-i18n";
import { HugeiconsIcon } from "@hugeicons/vue";
import { MinusSignIcon, CrownIcon } from "@hugeicons/core-free-icons";

const { t: $t } = useI18n();

const props = defineProps({
  person: {
    type: Object,
    required: true,
  },
});

const groupsStore = useBillGroupsStore();

const isOwner = computed(() => groupsStore.activeGroup?.ownerName === props.person.name);

function toggleOwner() {
  if (isOwner.value) {
    const confirmMsg = $t("messages.confirmRemoveOwner", { name: props.person.name });
    if (confirm(confirmMsg)) {
      groupsStore.setGroupOwner(props.person.name);
    }
    return;
  }
  const confirmMsg = $t("messages.confirmChangeOwner", { name: props.person.name });
  if (confirm(confirmMsg)) {
    groupsStore.setGroupOwner(props.person.name);
  }
}

function removePerson() {
  const personName = props.person.name;
  const billsWithPerson = groupsStore.activeBills.filter((bill) =>
    bill.payers.some((payer) => payer.name === personName)
  );

  if (billsWithPerson.length > 0) {
    const billDescriptions = billsWithPerson
      .map((bill) => bill.description)
      .join(", ");
    const confirmMessage = $t("messages.confirmRemovePersonFromBills", {
      name: personName,
      bills: billDescriptions,
    });

    if (confirm(confirmMessage)) {
      groupsStore.removePerson(personName);
      billsWithPerson.forEach((bill) => {
        groupsStore.removePayerFromBill(bill.id, personName);
      });
    }
  } else {
    groupsStore.removePerson(personName);
  }
}
</script>

<template>
  <li
    class="p-5 flex items-center justify-between hover:bg-neutral-50/50 transition-colors group"
  >
    <div class="flex items-center gap-4 flex-1 min-w-0">
      <div
        class="w-12 h-12 flex-shrink-0 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-500 font-black text-lg border border-neutral-200 group-hover:scale-105 transition-transform"
        :class="isOwner ? 'bg-amber-50 text-amber-500 border-amber-200' : ''"
      >
        <HugeiconsIcon v-if="isOwner" :icon="CrownIcon" size="18" />
        <span v-else>{{ person.name[0]?.toUpperCase() }}</span>
      </div>
      <div class="flex-1 min-w-0">
        <span
          class="text-base font-black text-neutral-800 tracking-tight truncate block w-full"
          >{{ person.name }}</span
        >
        <span v-if="isOwner" class="text-[9px] font-black text-amber-500 uppercase tracking-widest block mt-0.5">
          {{ $t('summary.billOwner') }}
        </span>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <!-- Toggle Owner Button -->
      <button
        @click="toggleOwner"
        class="w-10 h-10 flex items-center justify-center rounded-xl transition-colors flex-shrink-0"
        :class="isOwner ? 'text-amber-500 hover:text-amber-600 bg-amber-50' : 'text-neutral-300 hover:text-amber-500 hover:bg-amber-50/50'"
        :title="isOwner ? $t('summary.removeAsOwner') : $t('summary.setAsOwner')"
      >
        <HugeiconsIcon :icon="CrownIcon" size="18" :stroke-width="2.5" />
      </button>

      <!-- Delete Person Button -->
      <button
        @click="removePerson"
        class="w-10 h-10 flex items-center justify-center rounded-xl text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
        :aria-label="$t('people.removeMember')"
        :title="$t('people.removeMember')"
      >
        <HugeiconsIcon :icon="MinusSignIcon" size="20" :stroke-width="3" />
      </button>
    </div>
  </li>
</template>
