<script setup lang="ts">
import type { SpellSlotInfo } from '@/utils/types';
import SpellSlot from './SpellSlot.vue';

const props = defineProps<SpellSlotInfo>();
const free = defineModel<number>('free', { default: 0 });
const emits = defineEmits<{
    use: [];
    openEdit: [slot: SpellSlotInfo];
}>();

function useSlot() {
    if (free.value === undefined || free.value === 0) return;

    free.value--;
}

function restoreSlot() {
    if (free.value === undefined || free.value === props.count) return;

    free.value++;
}

function restoreSlots() {
    if (free.value === undefined) return;

    free.value = props.count;
}
</script>

<template>
    <article
        v-if="count"
        @click.exact="useSlot"
        @click.ctrl="emits('openEdit', { count, level, warlock, sorcerer })"
        @contextmenu.exact.prevent="restoreSlot"
        @contextmenu.ctrl.prevent="restoreSlots"
        class="flex cursor-pointer flex-col items-center gap-1 rounded bg-slate-800 p-2"
    >
        <h2 class="text-sm font-bold text-white capitalize select-none">
            {{ sorcerer ? 'SP' : level }}
        </h2>
        <section v-if="count < 5" class="grid grid-cols-2 gap-2">
            <SpellSlot
                :warlock="warlock"
                :sorcerer="sorcerer"
                :free="num <= free"
                :key="num"
                v-for="num in count"
            />
        </section>
        <section v-else>
            <SpellSlot
                class="flex items-center justify-center"
                :warlock="warlock"
                :sorcerer="sorcerer"
                :free="free > 0"
                big
            >
                <span
                    v-if="free"
                    :class="{
                        'text-2xl text-white select-none': true,
                        'absolute top-4': sorcerer,
                    }"
                >
                    {{ free }}
                </span>
            </SpellSlot>
        </section>
    </article>
</template>
