<script setup>
import { ref, watch } from 'vue';
import { COLOR_PALETTE } from '../../stores/BillGroups';

const props = defineProps({
    group: { type: Object, default: null }
});

const emit = defineEmits(['save', 'close']);

const name = ref('');
const selectedColor = ref(COLOR_PALETTE[0]);

watch(() => props.group, (newGroup) => {
    if (newGroup) {
        name.value = newGroup.name || '';
        selectedColor.value = newGroup.color || COLOR_PALETTE[0];
    }
}, { immediate: true });

function handleSave() {
    const trimmed = name.value.trim();
    if (!trimmed || !props.group) return;
    emit('save', props.group.id, { name: trimmed, color: selectedColor.value });
}

function handleClose() {
    emit('close');
}
</script>

<template>
    <Teleport to="body">
        <div v-if="group" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <!-- Backdrop -->
            <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="handleClose"></div>

            <!-- Modal -->
            <div class="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 animate-modalIn">
                <h2 class="text-xl font-bold text-neutral-700 mb-6">แก้ไขกลุ่มบิล</h2>

                <!-- Name Input -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-neutral-500 mb-2">ชื่อกลุ่ม</label>
                    <input v-model="name" type="text" placeholder="ชื่อกลุ่ม..." class="a-input"
                        @keyup.enter="handleSave" />
                </div>

                <!-- Color Picker -->
                <div class="mb-8">
                    <label class="block text-sm font-medium text-neutral-500 mb-3">เลือกสี</label>
                    <div class="flex flex-wrap gap-3">
                        <button v-for="color in COLOR_PALETTE" :key="color" @click="selectedColor = color"
                            class="w-10 h-10 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center"
                            :style="{ backgroundColor: color }"
                            :class="selectedColor === color ? 'ring-2 ring-offset-2 ring-neutral-400 scale-110' : ''">
                            <svg v-if="selectedColor === color" xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 24 24" stroke-width="2.5" stroke="white" class="w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Preview -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-neutral-500 mb-3">ตัวอย่าง</label>
                    <div class="a-card bg-white p-5 relative pointer-events-none">

                        <div class="flex justify-between items-start mb-6">
                            <div class="flex items-center gap-4">
                                <!-- Colored Icon Box -->
                                <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm transition-transform duration-300"
                                    :style="{ backgroundColor: selectedColor }">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                        stroke-width="2" stroke="currentColor" class="w-6 h-6">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                                    </svg>
                                </div>

                                <!-- Title & Subtitle -->
                                <div>
                                    <h3 class="font-bold text-neutral-800 text-lg leading-tight mb-1">{{ name ||
                                        'ตัวอย่าง' }}</h3>
                                    <div class="text-xs text-neutral-400 flex items-center gap-2">
                                        <span class="flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                                fill="currentColor" class="w-3 h-3">
                                                <path
                                                    d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.532-2.405 1.968 1.968 0 0 1 .449.278.618.618 0 0 1 .06.883l-3.414 4.301c-.131.18-.328.29-.53.29h-7.53ZM18.955 18.239A1.222 1.222 0 0 0 18.385 16h-5.289l2.449-3.084a.619.619 0 0 0 .079-.762 1.97 1.97 0 0 0-.585-.649 6.004 6.004 0 0 0-11.236 1.83.65.65 0 0 0 .145.426l.487.614c.25.316.326.736.21 1.125a.8.8 0 0 1-.767.575H1.615c-.295 0-.58.077-.828.213-.67.368-1.22.846-1.554 1.349a.669.669 0 0 1 .232.062 1.258 1.258 0 0 0 1.554-1.35c.245-.236.634-.413 1.098-.413h2.17c1.47 0 2.723.96 3.167 2.308.232.705.419 1.453.543 2.213h9.613c.124-.76.31-1.508.543-2.213.444-1.348 1.697-2.308 3.167-2.308h2.17c.464 0 .853.177 1.098.413a1.258 1.258 0 0 0 1.554 1.35.669.669 0 0 1 .232-.062c-.334-.504-.884-.981-1.554-1.349Z" />
                                                <path
                                                    d="M10 13a4.001 4.001 0 0 1-3.666 2.45L9 19h2l2.666-3.55A4.001 4.001 0 0 1 10 13Z" />
                                                <path fill-rule="evenodd"
                                                    d="M10 2a4 4 0 0 0-4 4v1H5a1 1 0 0 0-.994.89l-1 9A1 1 0 0 0 4 18h12a1 1 0 0 0 .994-1.11l-1-9A1 1 0 0 0 15 7h-1V6a4 4 0 0 0-4-4Zm0 2a2 2 0 0 1 2 2v1H8V6a2 2 0 0 1 2-2Z"
                                                    clip-rule="evenodd" />
                                            </svg>
                                            - คน
                                        </span>
                                        <span class="w-1 h-1 rounded-full bg-neutral-300"></span>
                                        <span>- บิล</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="flex items-end justify-between border-t border-dashed border-neutral-100 pt-3 mt-2">
                            <div class="text-xs text-neutral-400 font-medium pb-1">ยอดรวม</div>
                            <div class="text-2xl font-bold transition-colors duration-200"
                                :style="{ color: selectedColor }">
                                0 <span class="text-sm font-normal text-neutral-400 ml-0.5">บาท</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-3">
                    <button @click="handleClose" class="a-button-secondary flex-1">ยกเลิก</button>
                    <button @click="handleSave" class="a-button-primary flex-1" :disabled="!name.trim()"
                        :class="!name.trim() ? 'opacity-50 cursor-not-allowed' : ''">บันทึก</button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
@keyframes modalIn {
    from {
        opacity: 0;
        transform: scale(0.95) translateY(10px);
    }

    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.animate-modalIn {
    animation: modalIn 0.25s ease-out;
}
</style>
