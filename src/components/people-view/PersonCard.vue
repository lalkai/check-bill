<script setup>
import { usePeopleStore } from "../../stores/People";
import { useBillStore } from "../../stores/Bills";
import { useI18n } from "vue-i18n";

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
    <div class="flex items-center gap-4">
      <div
        class="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-500 font-black text-lg border border-neutral-200 group-hover:scale-110 transition-transform"
      >
        {{ person.name[0]?.toUpperCase() }}
      </div>
      <span
        class="text-base font-black text-neutral-800 tracking-tight break-words"
        >{{ person.name }}</span
      >
    </div>
    <button
      @click="removePerson"
      class="w-10 h-10 flex items-center justify-center rounded-xl text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
      :aria-label="$t('people.removeMember')"
      :title="$t('people.removeMember')"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2.5"
        stroke="currentColor"
        class="w-5 h-5"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
      </svg>
    </button>
  </li>
</template>
