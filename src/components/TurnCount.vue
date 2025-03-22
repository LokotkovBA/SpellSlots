<script setup lang="ts">
import { ref } from 'vue';

const count = ref(1);

function decr() {
    count.value--;

    if (count.value < 0) {
        count.value = 0;
    }
}
</script>

<template>
    <button
        @click="count++"
        @contextmenu.exact.prevent="decr"
        @contextmenu.ctrl.prevent="count = 0"
        class="flex cursor-pointer flex-col items-center gap-1 rounded bg-slate-800 p-2 text-white"
    >
        Turn:
        {{ count }}
    </button>
</template>
