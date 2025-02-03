<script setup lang="ts">
defineProps<{
  title: string;
  isCheckbox?: boolean;
  disabled?: boolean;
}>();

const checkboxModel = defineModel<boolean>('checkbox');
const numberModel = defineModel<number>('number');
</script>

<template>
  <section class="flex justify-between gap-3">
    {{ title }}
    <input
      v-if="isCheckbox"
      :disabled="disabled"
      :class="{ 'cursor-pointer': true, '': disabled }"
      v-model="checkboxModel"
      type="checkbox"
    />
    <input
      v-else
      :disabled="disabled"
      v-model.number="numberModel"
      type="text"
      :class="{
        'w-[4ch] rounded': true,
        'bg-gray-600 text-gray-300': disabled,
        'bg-slate-900': !disabled,
      }"
    />
  </section>
</template>
