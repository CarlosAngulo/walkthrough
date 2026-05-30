export type ThemeMode = 'dark' | 'light';
export type AccentColor = 'primary' | 'secondary' | 'neutral';

export interface ThemePreferences {
  theme: ThemeMode;
  fontSize: number;
  accentColor: AccentColor;
}
