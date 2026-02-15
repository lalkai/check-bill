<script setup>
import { ref } from 'vue';
import BillGroupCard from '../components/home-view/BillGroupCard.vue';
import CreateGroupModal from '../components/home-view/CreateGroupModal.vue';
import EditGroupModal from '../components/home-view/EditGroupModal.vue';
import { useBillGroupsStore } from '../stores/BillGroups';

const groupsStore = useBillGroupsStore();
const emit = defineEmits(['open-group']);

import { formatCurrency } from "../utils/common";

const showCreateModal = ref(false);
const editingGroup = ref(null);

function handleCreateGroup(name, color) {
    const group = groupsStore.addGroup(name, color);
    showCreateModal.value = false;
}

function handleOpenGroup(group) {
    emit('open-group', group.id);
}

function handleEditGroup(group) {
    editingGroup.value = { ...group };
}

function handleSaveEdit(groupId, updates) {
    groupsStore.updateGroup(groupId, updates);
    editingGroup.value = null;
}

function handleDeleteGroup(groupId) {
    if (confirm('ลบบิลกลุ่มนี้ทั้งหมด? ข้อมูลทั้งหมดจะหายไป')) {
        groupsStore.removeGroup(groupId);
    }
}
</script>

<template>
    <div class="space-y-8">
        <!-- Dashboard Summary -->
        <div
            class="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-4 px-4 sm:grid sm:grid-cols-2 sm:mx-0 sm:px-0 sm:overflow-visible">
            <div
                class="min-w-[85%] sm:min-w-0 snap-center a-card bg-gradient-to-br from-primary to-primary-light text-white flex flex-col justify-center h-32">
                <div class="flex items-center gap-2 text-white/80 text-sm font-medium mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                    </svg>
                    ยอดรวมทั้งหมด
                </div>
                <div class="flex items-baseline overflow-x-auto scrollbar-hide whitespace-nowrap min-w-0 text-2xl">
                    <span class="font-bold">{{ formatCurrency(groupsStore.totalAllGroupsAmount) }}</span>
                    <span class="text-sm font-normal opacity-80 ml-1.5">บาท</span>
                </div>
            </div>

            <div class="min-w-[85%] sm:min-w-0 snap-center a-card bg-white flex flex-col justify-center h-32">
                <div class="text-neutral-500 text-sm font-medium mb-1">กลุ่มทั้งหมด</div>
                <div class="text-3xl font-bold text-neutral-700 overflow-hidden break-all">
                    {{ groupsStore.groups.length }}
                    <span class="text-sm font-normal text-neutral-400">กลุ่ม</span>
                </div>
            </div>
        </div>

        <!-- Groups Section -->
        <div>
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-bold text-neutral-700">กลุ่มบิล</h2>
                <button @click="showCreateModal = true"
                    class="text-primary hover:text-primary-dark font-medium text-sm flex items-center gap-1 transition-colors px-2 py-1 -mr-2 rounded-lg hover:bg-neutral-50">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                        stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    สร้างกลุ่มใหม่
                </button>
            </div>

            <!-- Empty State -->
            <div v-if="groupsStore.groups.length === 0" class="a-card p-8 text-center">
                <div class="w-16 h-16 mx-auto rounded-full bg-neutral-50 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="w-8 h-8 text-neutral-400">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </div>
                <h3 class="text-neutral-900 font-medium mb-1">ยังไม่มีกลุ่มบิล</h3>
                <p class="text-neutral-500 text-sm mb-4">เริ่มต้นด้วยการสร้างกลุ่มค่าใช้จ่ายใหม่</p>
                <button @click="showCreateModal = true"
                    class="a-button-primary text-sm py-2 px-5 inline-flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                        stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    สร้างกลุ่ม
                </button>
            </div>

            <!-- Groups List -->
            <div v-else class="space-y-4">
                <BillGroupCard v-for="group in groupsStore.groups" :key="group.id" :group="group"
                    :billCount="groupsStore.getGroupBillCount(group.id)"
                    :peopleCount="groupsStore.getGroupPeopleCount(group.id)"
                    :totalAmount="groupsStore.getGroupTotalAmount(group.id)" @click="handleOpenGroup(group)"
                    @edit="handleEditGroup(group)" @delete="handleDeleteGroup(group.id)" />
            </div>
        </div>

        <!-- Modals -->
        <CreateGroupModal :show="showCreateModal" @create="handleCreateGroup" @close="showCreateModal = false" />
        <EditGroupModal :group="editingGroup" @save="handleSaveEdit" @close="editingGroup = null" />
    </div>
</template>
