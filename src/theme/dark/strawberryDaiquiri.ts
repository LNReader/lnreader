import { ColorScheme, ThemeType } from '../types';
import { errorColors, textColors } from '../colors';

const strawberryDaiquiriDarkTheme: ThemeType = {
  id: 5,
  name: 'Strawberry Daiquiri',
  ...textColors.dark,
  type: ColorScheme.DARK,
  primary: '#FFB2B9',
  onPrimary: '#67001B',
  primaryContainer: '#91002A',
  onPrimaryContainer: '#FFDADD',
  secondary: '#FFB2B9',
  onSecondary: '#67001B',
  secondaryContainer: '#91002A',
  onSecondaryContainer: '#FFDADD',
  tertiary: '#E8C08E',
  onTertiary: '#432C06',
  tertiaryContainer: '#5D421B',
  onTertiaryContainer: '#FFDDB1',
  background: '#201A1A',
  onBackground: '#ECDFDF',
  surface: '#322727',
  onSurface: '#ECDFDF',
  surfaceVariant: '#534344',
  onSurfaceVariant: '#D7C1C2',
  outline: '#A08C8D',
  inverseOnSurface: '#201A1A',
  inverseSurface: '#ECDFDF',
  primaryInverse: '#B61E40',
  rippleColor: '#FFB2B91E',
  divider: '#FFFFFF1E',
  ...errorColors.dark,
};

export default strawberryDaiquiriDarkTheme;
