import { ref, watch } from 'vue';
import { z } from 'zod';
import { OBR_METADATA_KEY } from '@/utils/consts';
import OBR from '@owlbear-rodeo/sdk';

export function useORBMetadata(id: string, initialValue: string) {
  const state = ref(initialValue);
  OBR.onReady(init);

  async function init() {
    const playerId = await OBR.player.getId();
    id += playerId;

    const metadataOBR = await OBR.room.getMetadata();
    const metadata = metadataOBR[OBR_METADATA_KEY];

    set(metadata, () => update(initialValue, metadata));
  }

  function set(metadata: unknown, onError?: () => void) {
    const { success, data } = z
      .object({ [id]: z.string() })
      .safeParse(metadata);

    if (!success) {
      onError?.();
      return;
    }

    state.value = data[id];
  }

  function update(value: string, metadata: unknown) {
    if (!metadata) {
      OBR.room.setMetadata({ [OBR_METADATA_KEY]: { [id]: value } });
      return;
    }

    OBR.room.setMetadata({ [OBR_METADATA_KEY]: { ...metadata, [id]: value } });
  }

  watch(state, async (value) => {
    const metadataOBR = await OBR.room.getMetadata();
    update(value, metadataOBR[OBR_METADATA_KEY]);
  });

  return { state };
}
