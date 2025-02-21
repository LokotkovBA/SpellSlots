<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import SpellSlotGroup from './components/SpellSlotGroup.vue';
import ModalWrapper from './components/ModalWrapper.vue';
import type { SpellSlotInfo, ModalRef } from './utils/types';
import FormField from './components/FormField.vue';
import { SPConvertion } from './utils/mappers';
import { MAX_CONVERTION_SPELL_SLOT_LEVEL } from './utils/consts';
import MainButton from './components/MainButton.vue';
import { useORBMetadata } from './composables/useORBMetadata';
import { spellslotsSchema } from './utils/schemas';
import { z } from 'zod';

const slotModal = ref<ModalRef>(null);
const spModal = ref<ModalRef>(null);

const sorceryPoints = reactive({ level: 0, count: 0, free: 0 });

const slots = reactive<(SpellSlotInfo & { free: number })[]>([
    { warlock: true, level: 1, count: 0, free: 0 },
    { level: 1, count: 1, free: 1 },
    { level: 2, count: 0, free: 0 },
    { level: 3, count: 0, free: 0 },
    { level: 4, count: 0, free: 0 },
    { level: 5, count: 0, free: 0 },
    { level: 6, count: 0, free: 0 },
    { level: 7, count: 0, free: 0 },
    { level: 8, count: 0, free: 0 },
    { level: 9, count: 0, free: 0 },
]);
const { state: slotState } = useORBMetadata('slots', JSON.stringify(slots));
watch(slots, (currentSlots) => {
    slotState.value = JSON.stringify(currentSlots);
});
watch(
    slotState,
    (slotsRaw) => {
        const { data, success, error } = z
            .array(spellslotsSchema)
            .safeParse(JSON.parse(slotsRaw));

        if (!success) {
            console.error('Failed to parse spell slots', error);
            return;
        }

        slots.length = 0;

        for (const slot of data) {
            slots.push(slot);
        }
    },
    { immediate: true },
);

const { state: spState } = useORBMetadata('sp', JSON.stringify(sorceryPoints));
watch(sorceryPoints, (currentPoints) => {
    spState.value = JSON.stringify(currentPoints);
});
watch(
    spState,
    (spRaw) => {
        const { data, success, error } = spellslotsSchema.safeParse(
            JSON.parse(spRaw),
        );

        if (!success) {
            console.error('Failed to parse sorcery points', error);
            return;
        }

        sorceryPoints.count = data.count;
        sorceryPoints.free = data.free;
    },
    { immediate: true },
);

const toAdd = reactive({ level: 1, count: 1, warlock: false, sorcerer: false });

const toConvert = reactive({ level: 1, count: 1 });
const spCost = computed(() => {
    return (SPConvertion[toConvert.level - 1] ?? 0) * toConvert.count;
});
const convertDisabled = computed(() => {
    const slot = slots[toConvert.level];

    return (
        toConvert.level > MAX_CONVERTION_SPELL_SLOT_LEVEL ||
        spCost.value > sorceryPoints.free ||
        !slot?.count ||
        slot.free === slot.count
    );
});

function edit() {
    if (toAdd.level === 0) {
        toAdd.level = 1;
    } else if (toAdd.level > 9) {
        toAdd.level = 9;
    }

    const index = toAdd.warlock ? 0 : toAdd.level;
    const slot = toAdd.sorcerer ? sorceryPoints : slots[index];
    if (!slot) return;

    if (toAdd.warlock && !toAdd.sorcerer) {
        slot.level = toAdd.level;
    }

    let newFree = slot.free;
    if (toAdd.count < slot.count) {
        newFree = newFree > toAdd.count ? toAdd.count : newFree;
    } else {
        newFree = toAdd.count - (slot.count - slot.free);
    }

    slot.free = newFree;
    slot.count = toAdd.count;
}

function openEdit(slot: SpellSlotInfo) {
    toAdd.count = slot.count;
    toAdd.level = slot.level;
    toAdd.warlock = !!slot.warlock;
    toAdd.sorcerer = !!slot.sorcerer;

    slotModal.value?.show();
}

function openConvert() {
    const maxSlotLevel = slots.findIndex(
        ({ count }, index) => index !== 0 && count !== 0,
    );
    const maxLevel = Math.min(
        maxSlotLevel,
        (SPConvertion.findIndex((val) => val === sorceryPoints.free) ?? -1) + 1,
    );

    toConvert.level = maxLevel;
    toConvert.count = maxLevel ? 1 : 0;

    spModal.value?.show();
}

function convertSP() {
    if (toConvert.level <= 0 && toConvert.count <= 0) return;

    const slot = slots[toConvert.level];
    if (!slot) return;

    slot.free += toConvert.count;
    if (slot.free > slot.count) {
        slot.free = slot.count;
    }
    sorceryPoints.free -= spCost.value * toConvert.count;
}
</script>

<template>
    <main class="flex w-full flex-col items-start gap-4 p-5">
        <section class="flex flex-wrap justify-center gap-3">
            <SpellSlotGroup
                @open-edit="openEdit"
                :count="slot.count"
                :level="slot.level"
                :warlock="slot.warlock"
                v-model:free="slot.free"
                :key="index"
                v-for="(slot, index) in slots"
            />
            <SpellSlotGroup
                v-if="sorceryPoints.count"
                :level="0"
                :count="sorceryPoints.count"
                v-model:free="sorceryPoints.free"
                sorcerer
                @open-edit="openEdit"
            />
        </section>

        <section class="flex gap-2">
            <MainButton @click="slotModal?.show()">Edit</MainButton>
            <MainButton v-if="sorceryPoints.count > 0" @click="openConvert()">
                Convert sorcery points
            </MainButton>
        </section>
    </main>

    <ModalWrapper
        centered
        class="self-center rounded bg-slate-800 p-4 text-white"
        ref="slotModal"
    >
        <form @submit.prevent="edit" class="flex flex-col gap-3 text-xs">
            Edit slots
            <FormField
                v-if="!toAdd.sorcerer"
                title="Level:"
                v-model:number="toAdd.level"
            />
            <FormField title="Count:" v-model:number="toAdd.count" />
            <FormField
                v-if="!toAdd.sorcerer"
                title="Warlock:"
                is-checkbox
                v-model:checkbox="toAdd.warlock"
            />
            <FormField
                v-if="!toAdd.warlock"
                title="Sorcerer:"
                is-checkbox
                v-model:checkbox="toAdd.sorcerer"
            />
            <MainButton type="submit">Edit</MainButton>
        </form>
    </ModalWrapper>

    <ModalWrapper
        centered
        class="mx-2 self-center rounded bg-slate-800 p-4 text-white"
        ref="spModal"
    >
        <form
            @submit.prevent="convertSP"
            class="flex flex-col gap-4 text-center text-sm"
        >
            Convert sorcery points to spell slots
            <FormField title="Level:" v-model:number="toConvert.level" />
            <FormField title="Count:" v-model:number="toConvert.count" />
            <MainButton :disabled="convertDisabled" type="submit">
                Convert
            </MainButton>
        </form>
    </ModalWrapper>
</template>
