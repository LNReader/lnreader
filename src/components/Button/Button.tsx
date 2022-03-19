import { Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';

import { ThemeTypeV1 } from '../../theme/v1/theme/types';

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
  margin?: number;
  theme: ThemeTypeV1;
}

const Button: React.FC<Props> = ({
  variation = ButtonVariation.DEFAULT,
  title,
  textColor,
  margin = 0,
  onPress,
  theme,
}) => {
  return (
    <View
      style={[
        styles.button,
        { margin },
        variation === 'outlined'
          ? {
              ...styles.outlined,
              borderColor: theme.textColorHint,
            }
          : variation !== 'clear' && {
              backgroundColor: theme.colorAccent,
            },
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
              : variation === 'outlined'
              ? theme.colorAccent
              : variation === 'default'
              ? theme.colorButtonText
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
