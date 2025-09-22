import { ReaderTheme } from '@screens/settings/constants/defaultValues';
import { presetReaderThemes } from '@utils/constants/readerConstants';

/**
 * Utility function to check if a theme matches the current theme
 * Optimized to avoid multiple array iterations
 */
export const isThemeMatch = (
  currentTheme: ReaderTheme,
  targetTheme: ReaderTheme,
): boolean => {
  return (
    currentTheme.backgroundColor === targetTheme.backgroundColor &&
    currentTheme.textColor === targetTheme.textColor
  );
};

/**
 * Check if current theme is a preset theme
 */
export const isCurrentThemePreset = (currentTheme: ReaderTheme): boolean => {
  return presetReaderThemes.some(preset => isThemeMatch(currentTheme, preset));
};

/**
 * Check if current theme is a custom theme
 */
export const isCurrentThemeCustom = (
  currentTheme: ReaderTheme,
  customThemes: ReaderTheme[],
): boolean => {
  return customThemes.some(custom => isThemeMatch(currentTheme, custom));
};
