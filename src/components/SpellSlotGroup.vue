<script setup lang="ts">
import type { SpellSlotInfo } from '@/utils/types';
import SpellSlot from './SpellSlot.vue';

const props = defineProps<SpellSlotInfo>();
const free = defineModel<number>('free');
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
    class="flex cursor-pointer flex-col items-center gap-3 rounded bg-slate-800 p-3"
  >
    <h2 class="select-nonem text-md text-white capitalize">{{ sorcerer ? 'SP' : level }}</h2>
    <section class="grid grid-cols-2 gap-3">
      <SpellSlot
        :warlock="warlock"
        :sorcerer="sorcerer"
        :free="num <= (free ?? 0)"
        :key="num"
        v-for="num in count"
      />
    </section>
  </article>
</template>
