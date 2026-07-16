import { z } from 'zod';
import { CAMPAIGN_LEVELS } from '@/lib/engine/scenario';
import type { Call } from '@/lib/engine/types';

const campaignLevelIds = new Set(CAMPAIGN_LEVELS.map(({ id }) => id));
const campaignLevelParamSchema = z
  .string()
  .regex(/^\d+$/)
  .transform(Number)
  .refine((value) => campaignLevelIds.has(value));
const callParamSchema = z.enum(['ship', 'kill', 'keep']);

export interface CampaignLevelResolution {
  levelId: number;
  isCanonical: boolean;
}
export function resolveCampaignLevel(rawLevel: string | null): CampaignLevelResolution {
  const parsed = campaignLevelParamSchema.safeParse(rawLevel);
  if (!parsed.success) return { levelId: CAMPAIGN_LEVELS[0].id, isCanonical: false };
  return { levelId: parsed.data, isCanonical: rawLevel === String(parsed.data) };
}

export function resolveCall(rawCall: string | null): Call | null {
  const parsed = callParamSchema.safeParse(rawCall);
  return parsed.success ? parsed.data : null;
}
