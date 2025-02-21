import type ModalWrapper from '@/components/ModalWrapper.vue';
import type { ComponentExposed } from 'vue-component-type-helpers';

export type ModalRef = ComponentExposed<typeof ModalWrapper> | null;

export type SpellSlotInfo = {
    warlock?: boolean;
    sorcerer?: boolean;
    level: number;
    count: number;
};
