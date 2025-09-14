import { TextInput, View, Text, StyleSheet } from 'react-native';
import { ThemeColors } from '@theme/types';
import { BaseSetting, NumberInputSetting } from '../../Settings';
import { useMemo } from 'react';
import { defaultTo } from 'lodash-es';
import { useSettingsContext } from '@components/Context/SettingsContext';
import { FilteredSettings } from '@screens/settings/constants/defaultValues';
import { sharedStyles } from '../utils/sharedStyles';

interface SettingSwitchProps {
  setting: NumberInputSetting & BaseSetting;
  theme: ThemeColors;
}

export default function SettingTextInput({
  setting,
  theme,
}: SettingSwitchProps) {
  const { setSettings, ...settings } = useSettingsContext();

  const currentValue = useMemo(() => {
    return settings[setting.valueKey];
  }, [setting.valueKey, settings]);
  const labelStyle = [
    sharedStyles.fontSize16,
    sharedStyles.input,
    { color: theme.onSurface },
  ];

  const update = (value: string, key: FilteredSettings<number>) => {
    setSettings({
      [key]: parseInt(value, 10),
    });
  };

  return (
    <View style={styles.container}>
      <Text
        style={[labelStyle, sharedStyles.paddingVertical, sharedStyles.flex]}
        numberOfLines={2}
      >
        {setting.title}
      </Text>
      <TextInput
        style={labelStyle}
        defaultValue={defaultTo(currentValue, 10).toString()}
        keyboardType="numeric"
        onChangeText={text => {
          if (text) {
            update(text, setting.valueKey);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...sharedStyles.paddingHorizontal,
    ...sharedStyles.flexRow,
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'scroll',
  },
});
