import {
    ACTION_WIDTH_MIN,
    MAIN_GAP,
    MAIN_HORIZONTAL_PADDING,
    SLOT_GROUP_WIDTH,
} from './consts';

export function calculateActionWidth(count: number) {
    return Math.max(
        ACTION_WIDTH_MIN,
        count * SLOT_GROUP_WIDTH +
            (count - 1) * MAIN_GAP +
            MAIN_HORIZONTAL_PADDING * 2,
    );
}
