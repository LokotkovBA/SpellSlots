<script setup lang="ts">
import { useModalStore } from '@/stores/modal';
import { onUnmounted, ref } from 'vue';

withDefaults(
  defineProps<{
    layer?: number;
    centered?: boolean;
  }>(),
  {
    layer: 0,
  },
);
const emits = defineEmits<{
  close: [];
}>();

const modalStore = useModalStore();

const visible = ref(false);
const modalOpenClass = 'modal-open';

function hide(event?: PointerEvent) {
  if ((event && event.pointerType === 'mouse' && event.button !== 0) || !visible.value) return;

  visible.value = false;

  afterHide();
}

function afterHide() {
  modalStore.decrement();

  if (modalStore.count < 1) {
    document.body.classList.remove(modalOpenClass);
  }
}

onUnmounted(afterHide);

function pointerDown() {
  hide();
  emits('close');
}

defineExpose({
  show() {
    modalStore.increment();

    visible.value = true;
    document.body.classList.add(modalOpenClass);
  },
  hide: pointerDown,
  visible,
});
</script>

<template>
  <Teleport to="#teleports">
    <Transition>
      <article
        v-if="visible"
        :class="{
          'fixed inset-0 flex h-full w-screen bg-slate-950/75': true,
          'justify-center': centered,
        }"
        :style="{ zIndex: layer + 1000 }"
        @pointerdown="pointerDown"
      >
        <div v-bind="$attrs" @pointerdown.stop>
          <slot />
        </div>
      </article>
    </Transition>

    <div v-bind="$attrs" class="!hidden" />
  </Teleport>
</template>

<style lang="css" scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.1s ease-in-out;
}

.v-enter-from,
.v-inter-to {
  opacity: 0;
}
</style>
