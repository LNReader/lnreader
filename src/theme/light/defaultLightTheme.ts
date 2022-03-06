import { errorColors, textColors } from '../colors';
import { ColorScheme } from '../types';

const defaultLightTheme = {
  id: 2,
  name: 'Default',
  ...textColors.light,
  type: ColorScheme.LIGHT,
  primary: '#0057CE',
  onPrimary: '#FFFFFF',
  primaryVariant: '#FFFFFF',
  primaryContainer: '#D8E2FF',
  onPrimaryContainer: '#001947',
  secondary: '#0057CE',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#D8E2FF',
  onSecondaryContainer: '#001947',
  tertiary: '#006E17',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#95F990',
  onTertiaryContainer: '#002202',
  background: '#FAFAFA',
  onBackground: '#1B1B1E',
  surface: '#E6ECF9',
  onSurface: '#1B1B1E',
  surfaceVariant: '#E1E2EC',
  onSurfaceVariant: '#44464E',
  outline: '#757780',
  inverseOnSurface: '#F2F0F4',
  inverseSurface: '#303033',
  primaryInverse: '#AEC6FF',
  rippleColor: '#0057CE1E',
  divider: '#0000001E',
  ...errorColors.light,
};

export default defaultLightTheme;
