import { StyleSheet, Text, TextStyle, View, TextInput } from 'react-native';
import React, { useEffect } from 'react';

import { useTheme } from '@hooks/useTheme';
import { IconButtonV2 } from '@components/index';
interface PlusMinusFieldProps {
  labelStyle?: TextStyle | TextStyle[];
  label: string;
  value: number;
  displayValue?: number | string;
  min?: number;
  max?: number;
  valueChange?: number;
  method: (value: number) => void;
}

const PlusMinusField: React.FC<PlusMinusFieldProps> = ({
  labelStyle,
  label,
  value,
  displayValue,
  min,
  max,
  valueChange = 1,
  method,
}) => {
  const theme = useTheme();
  const minusDisabled = min || min === 0 ? value <= min : false;
  const plusDisabled = max || max === 0 ? value >= max : false;
  const [text, onChangeText] = React.useState(value.toString());

  useEffect(() => {
    onChangeText(value.toString());
  }, [value]);

  const endEditing = () => {
    let res = isNaN(Number(text)) ? 0 : Number(text);
    if (min && res < min) {
      res = min;
    } else if (max && res > max) {
      res = max;
    }
    method(res);
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
            onPress={() => method(value - valueChange)}
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
            onPress={() => method(value + valueChange)}
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
