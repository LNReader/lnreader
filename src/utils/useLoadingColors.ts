import { ThemeColors } from '@theme/types';
import color from 'color';
import { useAppSettings } from '@hooks/persisted';
import { interpolateColor } from 'react-native-reanimated';

const useLoadingColors = (theme: ThemeColors) => {
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

  const { disableLoadingAnimations } = useAppSettings();

  if (disableLoadingAnimations) {
    //If loading animations is disabled highlight color is never shown so make background color more visible to compensate
    adjustedBackgroundColor = interpolateColor(
      0.01, //I have no idea why the interpolation amount has to be so small, I think its cus of the massive difference in alpha
      [0, 1],
      [adjustedBackgroundColor, highlightColor],
    );
  }

  return [highlightColor, adjustedBackgroundColor];
};
export default useLoadingColors;
