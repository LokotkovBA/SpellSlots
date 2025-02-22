<script setup lang="ts">
import SorceryPoint from './Icons/SorceryPoint.vue';

defineProps<{
    free: boolean;
    big?: boolean;
    warlock?: boolean;
    sorcerer?: boolean;
}>();
</script>

<template>
    <div class="relative" v-if="sorcerer">
        <SorceryPoint
            :class="{
                'size-14': big,
                'size-6': !big,
                'text-pink-600': free,
                'text-gray-600': !free,
            }"
        />
        <slot />
    </div>

    <div
        v-else
        :class="{
            'rounded-md': true,
            'size-14': big,
            'size-6': !big,
            'bg-blue-600': free && !warlock && !sorcerer,
            'bg-violet-600': warlock && free && !sorcerer,
            'bg-pink-600': sorcerer && free && !warlock,
            'bg-gray-600': !free,
        }"
    >
        <slot />
    </div>
</template>
