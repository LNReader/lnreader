import { ColorScheme } from '../types';
import { textColors } from '../colors';

const greenAppleDark = {
  id: 3,
  name: 'Green Apple',
  ...textColors.dark,
  type: ColorScheme.DARK,
  primary: '#7ADB8F',
  onPrimary: '#003915',
  primaryContainer: '#005322',
  onPrimaryContainer: '#96F8A9',
  secondary: '#7ADB8F',
  onSecondary: '#003915',
  secondaryContainer: '#005322',
  onSecondaryContainer: '#96F8A9',
  tertiary: '#FFB3AA',
  onTertiary: '#680006',
  tertiaryContainer: '#93000D',
  onTertiaryContainer: '#FFDAD5',
  background: '#1A1C19',
  onBackground: '#E1E3DD',
  surface: '#202A22',
  onSurface: '#E1E3DD',
  surfaceVariant: '#414941',
  onSurfaceVariant: '#C1C8BE',
  outline: '#8B9389',
  inverseOnSurface: '#1A1C19',
  inverseSurface: '#E1E3DD',
  primaryInverse: '#006D2F',
  error: '#FFB4A9',
  errorContainer: '#930006',
  onError: '#680003',
  onErrorContainer: '#FFDAD4',
  rippleColor: '#7ADB8F1E',
  divider: '#FFFFFF1E',
};

export default greenAppleDark;
