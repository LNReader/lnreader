import {Pressable, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {ThemeType} from '../../theme/types';

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
  theme: ThemeType;
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
        {margin},
        variation === 'outlined'
          ? {
              ...styles.outlined,
              borderColor: theme.outline,
            }
          : variation !== 'clear' && {
              backgroundColor: theme.primary,
            },
      ]}
    >
      <Pressable
        style={styles.pressable}
        onPress={onPress}
        android_ripple={{color: theme.rippleColor}}
      >
        <Text
          style={{
            color: textColor
              ? textColor
              : variation === 'outlined'
              ? theme.primary
              : variation === 'default'
              ? theme.onPrimary
              : theme.textColorPrimary,
          }}
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
    height: 40,
    justifyContent: 'center',
    borderRadius: 50,
    overflow: 'hidden',
  },
  pressable: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  outlined: {
    borderWidth: 1,
  },
});
