import { StyleSheet, Text, TextStyle, View } from 'react-native';
import React from 'react';

import { useTheme } from '@hooks/useTheme';
import { IconButtonV2 } from '@components/index';
interface PlusMinusFieldProps {
  labelStyle?: TextStyle | TextStyle[];
  label: string;
  value: number;
  displayValue?: number | string;
  min?: number;
  max?: number;
  onPressMinus: () => void;
  onPressPlus: () => void;
}

const PlusMinusField: React.FC<PlusMinusFieldProps> = ({
  labelStyle,
  label,
  value,
  displayValue,
  min,
  max,
  onPressMinus,
  onPressPlus,
}) => {
  const theme = useTheme();
  const minusDisabled = min || min === 0 ? value <= min : false;
  const plusDisabled = max || max === 0 ? value >= max : false;

  return (
    <View style={styles.container}>
      <Text
        style={[{ color: theme.onSurfaceVariant }, labelStyle, styles.text]}
      >
        {label}
      </Text>
      <View style={styles.buttonContainer}>
        <View style={styles.buttons}>
          <IconButtonV2
            name="minus"
            color={theme.primary}
            size={26}
            disabled={minusDisabled}
            onPress={onPressMinus}
            theme={theme}
          />
        </View>
        <Text style={[styles.value, { color: theme.onSurface }]}>
          {displayValue ? displayValue : value}
        </Text>
        <View style={styles.buttons}>
          <IconButtonV2
            name="plus"
            color={theme.primary}
            size={26}
            disabled={plusDisabled}
            onPress={onPressPlus}
            theme={theme}
          />
        </View>
      </View>
    </View>
  );
};

export default PlusMinusField;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 6,
  },
  text: {
    flex: 6,
  },
  value: {
    textAlign: 'center',
    flex: 2,
  },
  buttons: {
    flex: 1,
  },
  buttonContainer: {
    position: 'relative',
    flex: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
