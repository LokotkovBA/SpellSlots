<script setup lang="ts">
import { OBR_METADATA_KEY } from '@/utils/consts';
import OBR from '@owlbear-rodeo/sdk';
import { onMounted, ref, watch } from 'vue';
import { z } from 'zod';

const turnSchema = z.object({ turnNumber: z.number() });

const count = ref(1);

function decr() {
    count.value--;

    if (count.value < 0) {
        count.value = 0;
    }
}

watch(count, async (turnNumber) => {
    const metadata = (await OBR.room.getMetadata())[OBR_METADATA_KEY];

    if (!metadata) {
        OBR.room.setMetadata({
            [OBR_METADATA_KEY]: {
                turnNumber,
            },
        });

        return;
    }

    OBR.room.setMetadata({
        [OBR_METADATA_KEY]: {
            ...metadata,
            turnNumber,
        },
    });
});

onMounted(() => {
    OBR.onReady(async () => {
        OBR.room.onMetadataChange((metadata) => {
            const { data, error } = turnSchema.safeParse(
                metadata[OBR_METADATA_KEY],
            );

            if (error) return;

            const { turnNumber } = data;

            count.value = turnNumber;
        });

        const { data, error } = turnSchema.safeParse(
            (await OBR.room.getMetadata())[OBR_METADATA_KEY],
        );

        if (error) return;

        count.value = data.turnNumber;
    });
});
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
