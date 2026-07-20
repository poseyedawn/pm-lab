import { z } from 'zod';
import { CAMPAIGN_LEVELS } from '@/lib/engine/scenario';

const campaignLevelIds = new Set(CAMPAIGN_LEVELS.map(({ id }) => id));
const campaignLevelParamSchema = z
  .string()
  .regex(/^\d+$/)
  .transform(Number)
  .refine((value) => campaignLevelIds.has(value));

export interface CampaignLevelResolution {
  levelId: number;
  isCanonical: boolean;
}
export function resolveCampaignLevel(rawLevel: string | null): CampaignLevelResolution {
  const parsed = campaignLevelParamSchema.safeParse(rawLevel);
  if (!parsed.success) return { levelId: CAMPAIGN_LEVELS[0].id, isCanonical: false };
  return { levelId: parsed.data, isCanonical: rawLevel === String(parsed.data) };
}
