<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useBillGroupsStore } from "../../stores/BillGroups";
import { formatCurrency } from "../../utils/common";
import { HugeiconsIcon } from "@hugeicons/vue";
import {
  Tick01Icon,
  CrownIcon,
  Cancel01Icon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";
import { getIcon } from "../../utils/icons";
import CloseButton from "../common/CloseButton.vue";
import { useScrollLock } from "../../composables/useScrollLock";

const { t: $t } = useI18n();
const groupsStore = useBillGroupsStore();

const props = defineProps({
  show: { type: Boolean, default: false },
  payer: { type: Object, default: null },
});

const emit = defineEmits([
  "close",
  "toggle-item",
  "toggle-payment-status",
  "settle-all",
  "cancel-all",
]);
useScrollLock(computed(() => props.show));

const groupColor = computed(() => groupsStore.activeGroup?.color || "#0066cc");

const avatarStyle = computed(() =>
  props.payer?.isOwner
    ? { backgroundColor: "#f59e0b" }
    : { backgroundColor: groupColor.value },
);

const totalAmountClass = computed(() => {
  if (props.payer?.isOwner) return "text-amber-600";
  if (props.payer?.paid) return "text-green-600";
  return "text-orange-500";
});

const totalBgClass = computed(() => {
  if (props.payer?.isOwner) return "bg-amber-50 border-amber-100";
  if (props.payer?.paid) return "bg-green-50 border-green-100";
  return "bg-orange-50 border-orange-100";
});

const itemCardClass = (item) => {
  if (props.payer?.isOwner) return "border-neutral-100";
  if (item.paid) return "border-green-100 bg-green-50/40";
  return "border-neutral-100 bg-white";
};

const checkboxClass = (isPaid) =>
  isPaid
    ? "bg-green-500 border-green-500 text-white scale-100"
    : "border-neutral-300 bg-white text-transparent";

const categoryIconClass = (item) => {
  if (item.paid && !props.payer?.isOwner)
    return "bg-green-50 text-green-500 border-green-100";
  if (!item.paid && !props.payer?.isOwner)
    return "bg-orange-50 text-orange-400 border-orange-100";
  return "bg-neutral-50 text-neutral-400 border-neutral-100";
};

const amountClass = (item) => {
  if (item.paid && !props.payer?.isOwner) return "text-green-500";
  if (!item.paid && !props.payer?.isOwner) return "text-orange-500";
  return "text-neutral-700";
};

const allDatesArray = computed(() => {
  if (!props.payer?.dates) return [];
  return Object.entries(props.payer.dates)
    .sort((a, b) => new Date(b[0]) - new Date(a[0]))
    .map(([date, amount]) => ({ date, amount }));
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show && payer"
        class="fixed inset-0 z-50 flex items-end justify-center p-3 sm:p-4 sm:items-center"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-sm"
          @click="emit('close')"
        ></div>

        <!-- Modal card (same frame as original) -->
        <div
          class="relative bg-white rounded-[2.2rem] sm:rounded-[2.5rem] shadow-[0_24px_60px_rgba(0,0,0,0.18)] w-full max-w-md border border-white/20 max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
        >
          <!-- ── HEADER ── -->
          <div
            class="px-6 pt-6 pb-5 flex items-center gap-4 border-b border-neutral-100"
          >
            <!-- Avatar -->
            <div
              class="w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-sm"
              :style="avatarStyle"
            >
              <HugeiconsIcon
                v-if="payer.isOwner"
                :icon="CrownIcon"
                size="22"
                :stroke-width="2.5"
              />
              <span v-else>{{ payer.name[0]?.toUpperCase() }}</span>
            </div>

            <!-- Name -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h2
                  class="text-lg font-black text-neutral-900 tracking-tight leading-tight"
                >
                  {{ payer.name }}
                </h2>
                <span
                  v-if="payer.isOwner"
                  class="text-[9px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200"
                  >{{ $t("summary.billOwner") }}</span
                >
              </div>
              <p
                class="text-[10px] text-neutral-400 font-semibold uppercase tracking-widest mt-0.5"
              >
                {{
                  payer.isOwner
                    ? $t("summary.sponsoredDetails")
                    : $t("summary.expenseBreakdown")
                }}
                <span
                  v-if="
                    !payer.isOwner && !payer.paid && payer.unpaidAmountDue > 0
                  "
                  class="text-orange-500"
                >
                  · {{ $t("summary.remaining") }} ฿{{
                    formatCurrency(payer.unpaidAmountDue)
                  }}
                </span>
              </p>
            </div>

            <CloseButton @click="emit('close')" />
          </div>

          <!-- ── SCROLLABLE BODY ── -->
          <div
            data-scroll-inner
            class="flex-1 overflow-y-auto scrollbar-hide px-6 py-5 space-y-4"
          >
            <!-- Total amount card -->
            <div
              class="rounded-2xl border p-4 flex items-center justify-between"
              :class="totalBgClass"
            >
              <div>
                <p
                  class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1"
                >
                  {{
                    payer.isOwner
                      ? $t("summary.sponsoredTotal")
                      : $t("summary.total")
                  }}
                </p>
                <p
                  class="text-[28px] font-black leading-none"
                  :class="totalAmountClass"
                >
                  <span class="text-base opacity-50 mr-0.5">฿</span
                  >{{ formatCurrency(payer.totalAmountDue) }}
                </p>
              </div>
              <!-- Status pill -->
              <div v-if="!payer.isOwner">
                <span
                  v-if="payer.paid"
                  class="flex items-center gap-1.5 text-[11px] font-black text-green-600 bg-green-100 px-3 py-1.5 rounded-xl"
                >
                  <HugeiconsIcon
                    :icon="Tick01Icon"
                    size="13"
                    :stroke-width="3"
                  />
                  {{ $t("summary.paid") }}
                </span>
                <span
                  v-else
                  class="text-[11px] font-black text-orange-500 bg-orange-100 px-3 py-1.5 rounded-xl"
                >
                  {{ $t("dashboard.owes") }}
                </span>
              </div>
            </div>

            <!-- ── DAILY PAYMENTS with Items ── -->
            <div v-if="!payer.isOwner && allDatesArray.length > 0">
              <div class="flex items-center gap-2 mb-3">
                <HugeiconsIcon
                  :icon="Calendar03Icon"
                  size="13"
                  :stroke-width="2.5"
                  class="text-neutral-400"
                />
                <span
                  class="text-[10px] font-black text-neutral-400 uppercase tracking-widest"
                >
                  {{ $t("summary.dailyPayments") }}
                </span>
              </div>

              <div class="space-y-3">
                <div
                  v-for="dateItem in allDatesArray"
                  :key="dateItem.date"
                  class="rounded-2xl border overflow-hidden transition-colors"
                  :class="
                    groupsStore.getPaidStatusByDate(payer.name, dateItem.date)
                      ? 'bg-green-50/50 border-green-100'
                      : 'bg-neutral-50/50 border-neutral-100'
                  "
                >
                  <!-- Date header + toggle -->
                  <div class="flex items-center gap-3 px-4 py-3">
                    <div class="flex-1 min-w-0">
                      <p
                        class="text-[10px] text-neutral-400 font-semibold uppercase tracking-widest"
                      >
                        {{ dateItem.date }}
                      </p>
                      <p
                        class="text-base font-black text-neutral-800 leading-tight"
                      >
                        ฿{{
                          dateItem.amount
                            ? formatCurrency(dateItem.amount)
                            : "0.00"
                        }}
                      </p>
                    </div>
                    <button
                      @click="
                        emit('toggle-payment-status', payer, dateItem.date)
                      "
                      class="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wide transition-all active:scale-95 cursor-pointer"
                      :class="
                        groupsStore.getPaidStatusByDate(
                          payer.name,
                          dateItem.date,
                        )
                          ? 'bg-green-500 text-white shadow-sm hover:bg-green-600'
                          : 'bg-white border-2 border-orange-200 text-orange-500 hover:bg-orange-50'
                      "
                    >
                      <HugeiconsIcon
                        v-if="
                          groupsStore.getPaidStatusByDate(
                            payer.name,
                            dateItem.date,
                          )
                        "
                        :icon="Tick01Icon"
                        size="13"
                        :stroke-width="3"
                      />
                      {{
                        groupsStore.getPaidStatusByDate(
                          payer.name,
                          dateItem.date,
                        )
                          ? $t("summary.paid")
                          : $t("summary.markPaid")
                      }}
                    </button>
                  </div>

                  <!-- Bill items for this date -->
                  <div
                    v-for="(item, index) in payer.billItems.filter(
                      (b) => b.date === dateItem.date,
                    )"
                    :key="index"
                    @click="emit('toggle-item', payer.name, item.id)"
                    class="flex items-center gap-3 px-4 py-3 border-t border-neutral-100/80 bg-white cursor-pointer active:scale-[0.99] transition-all"
                  >
                    <!-- Checkbox -->
                    <div class="flex-shrink-0">
                      <div
                        class="w-5 h-5 rounded-lg flex items-center justify-center border-2 transition-all duration-150"
                        :class="checkboxClass(item.paid)"
                      >
                        <HugeiconsIcon
                          :icon="Tick01Icon"
                          size="11"
                          :stroke-width="3"
                        />
                      </div>
                    </div>

                    <!-- Icon -->
                    <div
                      class="w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center border"
                      :class="categoryIconClass(item)"
                    >
                      <HugeiconsIcon
                        :icon="getIcon(item.icon)"
                        size="14"
                        :stroke-width="2.5"
                      />
                    </div>

                    <!-- Text -->
                    <div class="flex-1 min-w-0">
                      <p
                        class="text-sm font-black text-neutral-800 truncate"
                        :class="
                          item.paid ? 'line-through text-neutral-400' : ''
                        "
                      >
                        {{ item.description }}
                      </p>
                    </div>

                    <!-- Amount -->
                    <span
                      class="text-sm font-black flex-shrink-0"
                      :class="amountClass(item)"
                    >
                      ฿{{ formatCurrency(item.amount) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── BILL ITEMS (Owner only) ── -->
            <div
              v-if="
                payer.isOwner && payer.billItems && payer.billItems.length > 0
              "
              class="space-y-2"
            >
              <div class="flex items-center gap-2 mb-2.5">
                <span
                  class="text-[10px] font-black text-neutral-400 uppercase tracking-widest"
                  >{{ $t("bills.items") }}</span
                >
              </div>

              <div
                v-for="(item, index) in payer.billItems"
                :key="index"
                class="border rounded-2xl bg-white transition-all duration-150 px-4 py-3"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center border"
                    :class="categoryIconClass(item)"
                  >
                    <HugeiconsIcon
                      :icon="getIcon(item.icon)"
                      size="16"
                      :stroke-width="2.5"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-black text-neutral-800 truncate">
                      {{ item.description }}
                    </p>
                    <p
                      class="text-[10px] text-neutral-400 font-semibold mt-0.5"
                    >
                      {{ item.date }}
                    </p>
                  </div>
                  <span
                    class="text-sm font-black flex-shrink-0 text-neutral-800"
                    >฿{{ formatCurrency(item.amount) }}</span
                  >
                </div>

                <!-- Owner: payers breakdown -->
                <div
                  v-if="item.payers && item.payers.length > 0"
                  class="mt-3 pt-3 border-t border-dashed border-neutral-100"
                >
                  <p
                    class="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1.5"
                  >
                    {{ $t("summary.payers") }}
                  </p>
                  <div class="flex flex-wrap gap-1.5">
                    <span
                      v-for="p in item.payers"
                      :key="p.name"
                      class="px-2 py-1 rounded-lg text-[9px] font-black flex items-center gap-1.5 border"
                      :class="[
                        p.name === groupsStore.activeGroup?.ownerName
                          ? 'bg-amber-50 border-amber-200 text-amber-700'
                          : p.paid
                            ? 'bg-green-50 text-green-600 border-green-100'
                            : 'bg-orange-50 text-orange-500 border-orange-100',
                      ]"
                    >
                      <HugeiconsIcon
                        v-if="p.name === groupsStore.activeGroup?.ownerName"
                        :icon="CrownIcon"
                        size="10"
                        :stroke-width="2.5"
                        class="text-amber-500"
                      />
                      <span
                        v-else
                        class="w-1.5 h-1.5 rounded-full"
                        :class="p.paid ? 'bg-green-500' : 'bg-orange-400'"
                      ></span>
                      {{ p.name }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── STICKY FOOTER ── -->
          <div
            v-if="!payer.isOwner"
            class="px-6 py-4 border-t border-neutral-100 bg-white flex-shrink-0"
          >
            <button
              v-if="!payer.paid"
              @click="emit('settle-all', payer)"
              class="w-full bg-neutral-800 text-white font-black text-[12px] uppercase tracking-widest py-4 px-6 rounded-2xl hover:bg-neutral-900 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <HugeiconsIcon :icon="Tick01Icon" size="15" :stroke-width="3" />
              {{ $t("summary.settleAllComplete") }}
            </button>

            <button
              v-else
              @click="emit('cancel-all', payer)"
              class="w-full bg-white border-2 border-neutral-200 text-neutral-600 font-black text-[12px] uppercase tracking-widest py-4 px-6 rounded-2xl hover:bg-neutral-50 hover:border-neutral-300 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <HugeiconsIcon
                :icon="Cancel01Icon"
                size="15"
                :stroke-width="2.5"
              />
              {{ $t("summary.cancelPayment") }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
