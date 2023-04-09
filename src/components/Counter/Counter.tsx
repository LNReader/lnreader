import { StyleSheet, Text, TextStyle, View, TextInput } from 'react-native';
import React, { useEffect } from 'react';

import { useTheme } from '@hooks/useTheme';
import { IconButtonV2 } from '@components/index';
interface CounterProps {
  labelStyle?: TextStyle | TextStyle[];
  label: string;
  value: number;
  displayValue?: number | string;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  onChange: (value: number) => void;
}

const Counter: React.FC<CounterProps> = ({
  labelStyle,
  label,
  value,
  displayValue,
  minimumValue,
  maximumValue,
  step = 1,
  onChange,
}) => {
  const theme = useTheme();
  const minusDisabled = value <= minimumValue;
  const plusDisabled = value >= maximumValue;
  const [text, onChangeText] = React.useState(value.toString());

  useEffect(() => {
    onChangeText(value.toString());
  }, [value]);

  const endEditing = () => {
    let res = isNaN(Number(text)) ? 0 : Number(text);
    if (minimumValue && res < minimumValue) {
      res = minimumValue;
    } else if (maximumValue && res > maximumValue) {
      res = maximumValue;
    }
    onChange(res);
    onChangeText(res.toString());
  };

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
            onPress={() => onChange(value - step)}
            theme={theme}
          />
        </View>
        <TextInput
          editable={displayValue ? false : true}
          style={[styles.value, { color: theme.onSurface }]}
          onEndEditing={endEditing}
          value={displayValue ? displayValue.toString() : text}
          onChangeText={onChangeText}
          keyboardType="numeric"
        />
        <View style={styles.buttons}>
          <IconButtonV2
            name="plus"
            color={theme.primary}
            size={26}
            disabled={plusDisabled}
            onPress={() => onChange(value + step)}
            theme={theme}
          />
        </View>
      </View>
    </View>
  );
};

export default Counter;

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
