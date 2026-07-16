import { track as vercelTrack } from '@vercel/analytics';
import { z } from 'zod';
import type { AnalyticsEventName, AnalyticsEventProperties } from '@/types/analytics';

const gameIdSchema = z.enum(['significant', 'ship-it']);
const modeSchema = z.enum(['calibration', 'campaign', 'daily']);
const archetypeSchema = z.enum([
  'clean-win',
  'clean-loss',
  'winners-curse',
  'peeking',
  'novelty',
  'underpowered',
  'multiple-comparisons',
  'seasonality',
  'srm',
  'simpson',
]);
const streakBandSchema = z.enum(['1-2', '3-6', '7-29', '30+']);
const clipboardSurfaceSchema = z.enum(['daily', 'profile']);

const analyticsEventSchema = z.discriminatedUnion('name', [
  z.object({ name: z.literal('lab_viewed'), referrerClass: z.enum(['direct', 'internal', 'portfolio', 'external']), viewportClass: z.enum(['mobile', 'tablet', 'desktop']) }).strict(),
  z.object({ name: z.literal('game_selected'), gameId: gameIdSchema, placement: z.literal('lab_primary') }).strict(),
  z.object({ name: z.literal('game_intro_viewed'), gameId: gameIdSchema, visitor: z.enum(['first', 'returning']) }).strict(),
  z.object({ name: z.literal('calibration_started'), gameId: gameIdSchema }).strict(),
  z.object({ name: z.literal('decision_made'), gameId: gameIdSchema, mode: modeSchema, level: z.union([z.number().int().min(1).max(10), z.literal('calibration'), z.literal('daily')]), call: z.enum(['ship', 'kill', 'keep']) })
    .strict()
    .superRefine((event, context) => {
      const hasCalibrationLevel = event.mode === 'calibration' && event.level === 'calibration';
      const hasCampaignLevel = event.mode === 'campaign' && typeof event.level === 'number';
      const hasDailyLevel = event.mode === 'daily' && event.level === 'daily';
      if (!hasCalibrationLevel && !hasCampaignLevel && !hasDailyLevel) {
        context.addIssue({ code: 'custom', message: 'Mode and level must match' });
      }
    }),
  z.object({ name: z.literal('reveal_viewed'), gameId: gameIdSchema, mode: modeSchema, correct: z.boolean(), archetype: archetypeSchema }).strict(),
  z.object({ name: z.literal('round_continued'), gameId: gameIdSchema, mode: modeSchema, nextAction: z.enum(['campaign_path', 'daily_result']) }).strict(),
  z.object({ name: z.literal('campaign_level_completed'), level: z.number().int().min(1).max(10), attempts: z.number().int().positive(), stars: z.union([z.literal(0), z.literal(1), z.literal(3)]) }).strict(),
  z.object({ name: z.literal('campaign_completed'), firstTryBand: z.enum(['0-3', '4-6', '7-9', '10']) }).strict(),
  z.object({ name: z.literal('daily_viewed'), state: z.enum(['unplayed', 'completed']) }).strict(),
  z.object({ name: z.literal('daily_completed'), correct: z.boolean(), streakBand: streakBandSchema }).strict(),
  z.object({ name: z.literal('daily_streak_extended'), streakBand: streakBandSchema }).strict(),
  z.object({ name: z.literal('share_attempted'), surface: clipboardSurfaceSchema, method: z.literal('clipboard') }).strict(),
  z.object({ name: z.literal('share_succeeded'), surface: clipboardSurfaceSchema, method: z.literal('clipboard') }).strict(),
  z.object({ name: z.literal('share_failed'), surface: clipboardSurfaceSchema, method: z.literal('clipboard'), reason: z.enum(['unavailable', 'permission', 'unknown']) }).strict(),
  z.object({ name: z.literal('case_study_viewed'), entrySurface: z.enum(['significant', 'direct', 'portfolio', 'external']) }).strict(),
  z.object({ name: z.literal('portfolio_returned'), entrySurface: z.enum(['lab', 'significant', 'case_study']) }).strict(),
  z.object({
    name: z.literal('settings_changed'),
    setting: z.enum(['sound', 'haptics', 'motion']),
    enabled: z.boolean().optional(),
    value: z.enum(['system', 'reduced', 'full']).optional(),
  }).strict().superRefine((event, context) => {
    const isToggle = (event.setting === 'sound' || event.setting === 'haptics')
      && typeof event.enabled === 'boolean'
      && event.value === undefined;
    const isMotion = event.setting === 'motion' && event.value !== undefined && event.enabled === undefined;
    if (!isToggle && !isMotion) context.addIssue({ code: 'custom', message: 'Setting and value must match' });
  }),
]);

export function validateAnalyticsEvent(value: unknown): boolean {
  return analyticsEventSchema.safeParse(value).success;
}

export function track<Name extends AnalyticsEventName>(
  name: Name,
  properties: AnalyticsEventProperties<Name>,
): void {
  try {
    const parsed = analyticsEventSchema.safeParse({ name, ...properties });
    if (!parsed.success) return;
    const { name: validatedName, ...validatedProperties } = parsed.data;
    vercelTrack(validatedName, validatedProperties);
  } catch {
    // Analytics is optional and must never interrupt play.
  }
}

export function classifyViewport(width: number): 'mobile' | 'tablet' | 'desktop' {
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function classifyReferrer(
  referrer: string,
  currentOrigin: string,
): 'direct' | 'internal' | 'portfolio' | 'external' {
  if (!referrer) return 'direct';
  try {
    const origin = new URL(referrer).origin;
    if (origin === currentOrigin) return 'internal';
    if (origin === 'https://alvn.io' || origin === 'https://www.alvn.io') return 'portfolio';
    return 'external';
  } catch {
    return 'external';
  }
}

export function classifyCaseStudyEntry(
  referrer: string,
  currentOrigin: string,
  declaredSource?: string | null,
): AnalyticsEventProperties<'case_study_viewed'>['entrySurface'] {
  if (declaredSource === 'significant' || declaredSource === 'portfolio') return declaredSource;
  if (!referrer) return 'direct';
  try {
    const url = new URL(referrer);
    if (url.origin === currentOrigin && url.pathname.startsWith('/significant')) return 'significant';
    if (url.origin === 'https://alvn.io' || url.origin === 'https://www.alvn.io') return 'portfolio';
    return 'external';
  } catch {
    return 'external';
  }
}

export function streakBand(streak: number): AnalyticsEventProperties<'daily_completed'>['streakBand'] {
  if (streak >= 30) return '30+';
  if (streak >= 7) return '7-29';
  if (streak >= 3) return '3-6';
  return '1-2';
}

export function firstTryBand(firstTry: number): AnalyticsEventProperties<'campaign_completed'>['firstTryBand'] {
  if (firstTry >= 10) return '10';
  if (firstTry >= 7) return '7-9';
  if (firstTry >= 4) return '4-6';
  return '0-3';
}
