<script setup lang="ts">
defineProps<{
  free: boolean;
  warlock?: boolean;
  sorcerer?: boolean;
}>();
</script>

<template>
  <div
    :class="{
      'size-10 rounded-md': true,
      'bg-blue-600': free && !warlock && !sorcerer,
      'bg-violet-600': warlock && free && !sorcerer,
      'bg-pink-600': sorcerer && free && !warlock,
      'bg-gray-600': !free,
    }"
  ></div>
</template>
