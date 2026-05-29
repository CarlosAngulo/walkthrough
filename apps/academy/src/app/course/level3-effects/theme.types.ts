export type ThemeMode = 'dark' | 'light';
export type AccentColor = 'purple' | 'cyan' | 'pink';

export interface ThemePreferences {
  theme: ThemeMode;
  fontSize: number;
  accentColor: AccentColor;
}
