import { z } from 'zod';

export const spellslotsSchema = z.object({
  warlock: z.boolean().optional(),
  level: z.number(),
  count: z.number(),
  free: z.number(),
});
