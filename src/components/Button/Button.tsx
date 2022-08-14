import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import React, { useMemo } from 'react';

import { ThemeType } from '../../theme/types';

export enum ButtonVariation {
  DEFAULT = 'default',
  OUTLINED = 'outlined',
  CLEAR = 'clear',
}

interface Props {
  variation?: ButtonVariation;
  title: string;
  textColor?: string;
  onPress?: () => void;
  theme: ThemeType;
  style?: ViewStyle;
  labelStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

const Button: React.FC<Props> = ({
  variation = ButtonVariation.DEFAULT,
  title,
  textColor,
  onPress,
  theme,
  style,
  disabled,
  labelStyle,
}) => {
  const textStyles: StyleProp<TextStyle> = useMemo(
    () => ({
      color: disabled
        ? theme.textColorHint
        : textColor
        ? textColor
        : variation === ButtonVariation.OUTLINED
        ? theme.colorAccent
        : variation === ButtonVariation.CLEAR
        ? theme.colorAccent
        : theme.textColorPrimary,
    }),
    [],
  );

  return (
    <View
      style={[
        styles.button,
        variation === ButtonVariation.OUTLINED
          ? {
              ...styles.outlined,
              borderColor: theme.textColorHint,
            }
          : variation !== ButtonVariation.CLEAR && {
              backgroundColor: theme.colorAccent,
            },
        style,
      ]}
    >
      <Pressable
        style={styles.pressable}
        onPress={onPress}
        android_ripple={{ color: theme.rippleColor }}
        disabled={disabled}
      >
        <Text style={[textStyles, labelStyle]} numberOfLines={1}>
          {title}
        </Text>
      </Pressable>
    </View>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    minHeight: 40,
    justifyContent: 'center',
    borderRadius: 50,
    overflow: 'hidden',
  },
  pressable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  outlined: {
    borderWidth: 1,
  },
});
