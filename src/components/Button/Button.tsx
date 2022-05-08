import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import React from 'react';

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
}

const Button: React.FC<Props> = ({
  variation = ButtonVariation.DEFAULT,
  title,
  textColor,
  onPress,
  theme,
  style,
}) => {
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
      >
        <Text
          style={{
            color: textColor
              ? textColor
              : variation === ButtonVariation.OUTLINED
              ? theme.colorAccent
              : variation === ButtonVariation.CLEAR
              ? theme.colorAccent
              : theme.textColorPrimary,
          }}
          numberOfLines={1}
        >
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
