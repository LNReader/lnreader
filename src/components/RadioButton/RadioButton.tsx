import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { RadioButton as PaperRadioButton } from 'react-native-paper';
import { ThemeType } from '../../theme/types';

interface Props {
  label: string;
  status: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  theme: ThemeType;
}

export const RadioButton: React.FC<Props> = ({
  label,
  status,
  onPress,
  style,
  labelStyle,
  theme,
}) => (
  <Pressable
    android_ripple={{ color: theme.rippleColor }}
    style={[styles.pressable, style]}
    onPress={onPress}
  >
    <PaperRadioButton
      status={status ? 'checked' : 'unchecked'}
      value={label}
      onPress={onPress}
      color={theme.colorAccent}
      uncheckedColor={theme.textColorSecondary}
    />
    <Text
      style={[styles.label, labelStyle, { color: theme.textColorSecondary }]}
    >
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  pressable: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    left: 24,
    alignSelf: 'center',
  },
  label: {
    marginLeft: 12,
  },
});
