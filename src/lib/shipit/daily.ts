import { hashString } from '@/lib/prng';

export const shipitDailySeed = (date: string): number => hashString(`shipit-daily-${date}`);
