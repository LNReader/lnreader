import { StyleSheet, TextInput, View, Text } from 'react-native';
import { ThemeColors } from '@theme/types';
import { BaseSetting, NumberInputSetting } from '../../Settings';
import { useMemo } from 'react';
import { defaultTo } from 'lodash-es';
import { useSettingsContext } from '@components/Context/SettingsContext';
import { FilteredSettings } from '@screens/settings/constants/defaultValues';

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
    if (setting.settingsOrigin) {
      throw new Error('settingsOrigin is not implemented');
    }
    return settings[setting.valueKey];
  }, [setting.settingsOrigin, setting.valueKey, settings]);
  const labelStyle = [styles.fontSizeL, { color: theme.onSurface }];

  const update = (value: string, key: FilteredSettings<number>) => {
    setSettings({
      [key]: parseInt(value, 10),
    });
  };

  return (
    <View style={styles.autoScrollInterval}>
      <Text style={[labelStyle, styles.paddingRightM]} numberOfLines={2}>
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
  fontSizeL: {
    fontSize: 16,
    width: 50,
    height: 46,
    textAlignVertical: 'center',
  },
  autoScrollInterval: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    //? overflow scroll because the animation looks better
    overflow: 'scroll',
  },
  paddingRightM: {
    paddingVertical: 12,
    flex: 1,
  },
});
