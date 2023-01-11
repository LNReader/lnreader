import { MD3ThemeType } from '@theme/types';
import color from 'color';

const getLoadingColors = (theme: MD3ThemeType) => {
  const highlightColor = color(theme.primary).alpha(0.08).string();
  let backgroundColor = theme.surface;

  backgroundColor = color(backgroundColor).isDark()
    ? color(backgroundColor).luminosity() !== 0
      ? color(backgroundColor).lighten(0.1).toString()
      : color(backgroundColor).negate().darken(0.98).toString()
    : color(backgroundColor).darken(0.04).toString();

  return [highlightColor, backgroundColor];
};
export default getLoadingColors;
