import { ColorScheme } from '../types';
import { textColors } from '../colors';

const midnightDuskDark = {
  id: 4,
  name: 'Midnight Dusk',
  ...textColors.dark,
  type: ColorScheme.DARK,
  primary: '#F02475',
  onPrimary: '#66002A',
  primaryContainer: '#8F003F',
  onPrimaryContainer: '#FFD9E1',
  secondary: '#F02475',
  onSecondary: '#66002A',
  secondaryContainer: '#8F003F',
  onSecondaryContainer: '#FFD9E1',
  tertiary: '#EDBE91',
  onTertiary: '#462A09',
  tertiaryContainer: '#60401D',
  onTertiaryContainer: '#FFDCBA',
  background: '#16151D',
  onBackground: '#E5E1E5',
  surface: '#262027',
  onSurface: '#E5E1E5',
  surfaceVariant: '#524346',
  onSurfaceVariant: '#D6C1C4',
  outline: '#9F8C8F',
  inverseOnSurface: '#1C1B1F',
  inverseSurface: '#E5E1E5',
  primaryInverse: '#BB0054',
  error: '#FFB4A9',
  errorContainer: '#930006',
  onError: '#680003',
  onErrorContainer: '#FFDAD4',
  rippleColor: '#F024751E',
  divider: '#FFFFFF1E',
};

export default midnightDuskDark;
