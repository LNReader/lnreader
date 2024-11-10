import { ThemeColors } from '@theme/types';
import color from 'color';

const getLoadingColors = (theme: ThemeColors) => {
  const highlightColor = color(theme.primary).alpha(0.08).string();
  const backgroundColor = color(theme.surface);

  let adjustedBackgroundColor;

  if (backgroundColor.isDark()) {
    adjustedBackgroundColor =
      backgroundColor.luminosity() !== 0
        ? backgroundColor.lighten(0.1).toString()
        : backgroundColor.negate().darken(0.98).toString();
  } else {
    adjustedBackgroundColor = backgroundColor.darken(0.04).toString();
  }

  return [highlightColor, adjustedBackgroundColor];
};
export default getLoadingColors;
