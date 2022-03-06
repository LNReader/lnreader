import { ColorScheme } from '../types';
import { errorColors, textColors } from '../colors';

const defaultDarkTheme = {
  id: 1,
  name: 'Default',
  ...textColors.dark,
  type: ColorScheme.DARK,
  primary: '#AEC6FF',
  onPrimary: '#002C71',
  primaryContainer: '#00419E',
  onPrimaryContainer: '#D8E2FF',
  secondary: '#AEC6FF',
  onSecondary: '#002C71',
  secondaryContainer: '#00419E',
  onSecondaryContainer: '#D8E2FF',
  tertiary: '#7ADC77',
  onTertiary: '#003907',
  tertiaryContainer: '#00530D',
  onTertiaryContainer: '#95F990',
  background: '#1B1B1E',
  onBackground: '#E4E2E6',
  surface: '#272931',
  onSurface: '#E4E2E6',
  surfaceVariant: '#44464E',
  onSurfaceVariant: '#C5C6D0',
  outline: '#8E9099',
  inverseOnSurface: '#1B1B1E',
  inverseSurface: '#E4E2E6',
  primaryInverse: '#0057CE',
  rippleColor: '#AEC6FF1E',
  divider: '#FFFFFF1E',
  ...errorColors.dark,
};

export default defaultDarkTheme;
