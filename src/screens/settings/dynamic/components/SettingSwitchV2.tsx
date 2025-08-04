import { SwitchItem } from '@components';
import { ThemeColors } from '@theme/types';
import { BaseSetting, SettingOrigin, SwitchSetting } from '../../Settings';
import { useLastUpdate } from '@hooks/persisted';
import React, { useMemo } from 'react';
import RenderSettings from '../RenderSettings';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native';
import { useSettingsContext } from '@components/Context/SettingsContext';
import { FilteredSettings } from '@screens/settings/constants/defaultValues';

interface SettingSwitchProps {
  setting: SwitchSetting & BaseSetting;
  theme: ThemeColors;
  quickSettings?: boolean;
  endOfLine?: () => React.ReactNode;
}

const SettingSwitchV2 = ({
  setting,
  theme,
  quickSettings,
  endOfLine,
}: SettingSwitchProps): React.ReactElement => {
  const settings = useSettingsContext();
  const { showLastUpdateTime, setShowLastUpdateTime } = useLastUpdate();

  const currentValue = useMemo(() => {
    if (setting.settingsOrigin === 'lastUpdateTime') return showLastUpdateTime;
    return settings[setting.valueKey!];
  }, [setting.settingsOrigin, setting.valueKey, settings, showLastUpdateTime]);

  const dependents = useMemo(() => {
    return setting.dependents?.filter(d =>
      quickSettings ? d.quickSettings : true,
    );
  }, [quickSettings, setting.dependents]);

  const maxHeight = useSharedValue(
    currentValue && dependents?.length ? 60 * (dependents?.length ?? 0) : 0,
  );
  const opacity = useSharedValue(1);
  const update = (
    value: boolean,
    key?: FilteredSettings<boolean>,
    origin?: SettingOrigin,
  ) => {
    maxHeight.value = value ? 60 * (dependents?.length ?? 0) : 0;
    opacity.value = value ? 1 : 0;

    if (origin === 'lastUpdateTime' || !key) {
      return setShowLastUpdateTime(value);
    }
    settings.setSettings({
      [key]: value,
    });
  };
  const duration = 250;
  const hideDependents = useAnimatedStyle(() => {
    return {
      maxHeight: withTiming(maxHeight.value, { duration }),
      opacity: withTiming(opacity.value, {
        duration,
        easing: Easing.out(Easing.exp),
      }),
    };
  });

  return (
    <>
      <SwitchItem
        value={currentValue}
        label={setting.title}
        description={!quickSettings ? setting.description : undefined}
        onPress={() =>
          update(!currentValue, setting.valueKey, setting.settingsOrigin)
        }
        theme={theme}
        style={styles.paddingHorizontal}
        endOfLine={endOfLine}
        quickSettingsItem={quickSettings}
      />
      {!dependents ? null : (
        <Animated.View style={hideDependents}>
          {dependents.map((dep, i) => {
            return (
              <RenderSettings
                key={'dep' + setting.title + i}
                setting={dep}
                quickSettings={quickSettings}
              />
            );
          })}
        </Animated.View>
      )}
    </>
  );
};
export default React.memo(SettingSwitchV2);

const styles = StyleSheet.create({
  paddingHorizontal: { paddingHorizontal: 16 },
});
