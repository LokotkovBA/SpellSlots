<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import SpellSlotGroup from './components/SpellSlotGroup.vue';
import ModalWrapper from './components/ModalWrapper.vue';
import type { SpellSlotInfo, ModalRef } from './utils/types';
import FormField from './components/FormField.vue';
import { SPConvertion } from './utils/mappers';
import { MAX_CONVERTION_SPELL_SLOT_LEVEL } from './utils/consts';

const slotModal = ref<ModalRef>(null);
const spModal = ref<ModalRef>(null);

const sorceryPoints = reactive({
  level: 0,
  count: 0,
  free: 0,
});

const slots = reactive<
  (SpellSlotInfo & {
    free: number;
  })[]
>([
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

const toAdd = reactive({
  level: 1,
  count: 1,
  warlock: false,
  sorcerer: false,
});

const toConvert = reactive({
  level: 1,
  count: 1,
});
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
  const maxSlotLevel = slots.findIndex(({ count }, index) => index !== 0 && count !== 0);
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
  <main class="flex w-full flex-col items-center gap-6 p-10">
    <section class="flex flex-wrap justify-center gap-6">
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

    <section class="flex flex-col gap-2">
      <button @click="slotModal?.show()" class="rounded bg-yellow-600 px-2 py-1">Edit</button>
      <button
        v-if="sorceryPoints.count > 0"
        @click="openConvert()"
        class="rounded bg-yellow-600 px-2 py-1 disabled:bg-gray-600"
      >
        Convert sorcery points
      </button>
    </section>
  </main>

  <ModalWrapper centered class="self-center rounded bg-slate-800 p-6 text-white" ref="slotModal">
    <form @submit.prevent="edit" class="flex flex-col gap-4 text-2xl">
      Edit slots
      <FormField v-if="!toAdd.sorcerer" title="Level:" v-model:number="toAdd.level" />
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
      <button class="rounded bg-yellow-600 p-2 text-slate-950" type="submit">Edit</button>
    </form>
  </ModalWrapper>

  <ModalWrapper centered class="mx-4 self-center rounded bg-slate-800 p-6 text-white" ref="spModal">
    <form @submit.prevent="convertSP" class="flex flex-col gap-4 text-center text-2xl">
      Convert sorcery points to spell slots
      <FormField title="Level:" v-model:number="toConvert.level" />
      <FormField title="Count:" v-model:number="toConvert.count" />
      <button
        :disabled="convertDisabled"
        class="rounded bg-yellow-600 p-2 text-slate-950 disabled:bg-gray-600"
        type="submit"
      >
        Convert
      </button>
    </form>
  </ModalWrapper>
</template>
