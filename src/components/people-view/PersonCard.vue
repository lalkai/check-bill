<script setup>
import { usePeopleStore } from "../../stores/People";
import { useBillStore } from "../../stores/Bills";
import { useI18n } from "vue-i18n";
import { HugeiconsIcon } from "@hugeicons/vue";
import { MinusSignIcon } from "@hugeicons/core-free-icons";

const { t: $t } = useI18n();

const props = defineProps({
  person: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});

const peopleStore = usePeopleStore();
const billStore = useBillStore();

function removePerson() {
  const personName = props.person.name;
  const billsWithPerson = billStore.bills.filter((bill) =>
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
      peopleStore.remove(props.index);
      billsWithPerson.forEach((bill) => {
        billStore.removePayerFromBill(bill.id, personName);
      });
    }
  } else {
    peopleStore.remove(props.index);
  }
}
</script>

<template>
  <li
    class="p-5 flex items-center justify-between hover:bg-neutral-50/50 transition-colors group"
  >
    <div class="flex items-center gap-4 flex-1 min-w-0">
      <div
        class="w-12 h-12 flex-shrink-0 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-500 font-black text-lg border border-neutral-200 group-hover:scale-110 transition-transform"
      >
        {{ person.name[0]?.toUpperCase() }}
      </div>
      <span
        class="text-base font-black text-neutral-800 tracking-tight truncate block w-full"
        >{{ person.name }}</span
      >
    </div>
    <button
      @click="removePerson"
      class="w-10 h-10 flex items-center justify-center rounded-xl text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
      :aria-label="$t('people.removeMember')"
      :title="$t('people.removeMember')"
    >
      <HugeiconsIcon :icon="MinusSignIcon" size="20" stroke-width="3" />
    </button>
  </li>
</template>
