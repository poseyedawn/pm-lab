export type MotionPreference = 'system' | 'reduced' | 'full';

export interface LabPreferences {
  sound: boolean;
  haptics: boolean;
  motion: MotionPreference;
}

export interface StoredLabPreferences {
  version: 1;
  preferences: LabPreferences;
}
