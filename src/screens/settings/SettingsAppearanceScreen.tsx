import React, { useState } from 'react';
import { ScrollView, Text } from 'react-native';

import { ThemePicker } from '@components/ThemePicker/ThemePicker';
import SwitchSetting from '@components/Switch/Switch';
import ColorPickerModal from '@components/ColorPickerModal/ColorPickerModal';

import { useAppSettings, useTheme } from '@hooks/persisted';
import {
  defaultTheme,
  midnightDusk,
  tealTurquoise,
  yotsubaTheme,
  lavenderTheme,
  strawberryDaiquiriTheme,
  takoTheme,
} from '@theme/md3';

import {
  useMMKVBoolean,
  useMMKVObject,
  useMMKVString,
} from 'react-native-mmkv';
import { Appbar, List } from '@components';
import { AppearanceSettingsScreenProps } from '@navigators/types';
import { getString } from '@strings/translations';

const lightThemes = [
  defaultTheme.light,
  midnightDusk.light,
  tealTurquoise.light,
  yotsubaTheme.light,
  lavenderTheme.light,
  strawberryDaiquiriTheme.light,
  takoTheme.light,
];
const darkThemes = [
  defaultTheme.dark,
  midnightDusk.dark,
  tealTurquoise.dark,
  yotsubaTheme.dark,
  lavenderTheme.dark,
  strawberryDaiquiriTheme.dark,
  takoTheme.dark,
];

const AppearanceSettings = ({ navigation }: AppearanceSettingsScreenProps) => {
  const theme = useTheme();
  const [, setTheme] = useMMKVObject('APP_THEME');
  const [isAmoledBlack = false, setAmoledBlack] =
    useMMKVBoolean('AMOLED_BLACK');
  const [, setCustomAccentColor] = useMMKVString('CUSTOM_ACCENT_COLOR');

  const {
    showHistoryTab,
    showUpdatesTab,
    showLabelsInNav,
    hideBackdrop,
    useFabForContinueReading,
    setAppSettings,
  } = useAppSettings();

  /**
   * Accent Color Modal
   */
  const [accentColorModal, setAccentColorModal] = useState(false);
  const showAccentColorModal = () => setAccentColorModal(true);
  const hideAccentColorModal = () => setAccentColorModal(false);

  return (
    <>
      <Appbar
        title={getString('appearance')}
        handleGoBack={navigation.goBack}
        theme={theme}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <List.Section>
          <List.SubHeader theme={theme}>
            {getString('appearanceScreen.appTheme')}
          </List.SubHeader>
          <Text
            style={{
              color: theme.onSurface,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            {getString('appearanceScreen.lightTheme')}
          </Text>
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              flexDirection: 'row',
            }}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          >
            {lightThemes.map(item => (
              <ThemePicker
                key={item.id}
                currentTheme={theme}
                theme={item}
                onPress={() => {
                  setTheme(item);
                  setCustomAccentColor(undefined);
                }}
              />
            ))}
          </ScrollView>
          <Text
            style={{
              color: theme.onSurface,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            {getString('appearanceScreen.darkTheme')}
          </Text>
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              flexDirection: 'row',
            }}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          >
            {darkThemes.map(item => (
              <ThemePicker
                key={item.id}
                currentTheme={theme}
                theme={item}
                onPress={() => {
                  setTheme(item);
                  setCustomAccentColor(undefined);
                }}
              />
            ))}
          </ScrollView>
          {theme.isDark && (
            <SwitchSetting
              label={getString('appearanceScreen.pureBlackDarkMode')}
              value={isAmoledBlack}
              onPress={() => setAmoledBlack(prevVal => !prevVal)}
              theme={theme}
            />
          )}
          <List.ColorItem
            title={getString('appearanceScreen.accentColor')}
            description={theme.primary.toUpperCase()}
            onPress={showAccentColorModal}
            theme={theme}
          />
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>
            {getString('appearanceScreen.novelInfo')}
          </List.SubHeader>
          <SwitchSetting
            label={getString('appearanceScreen.hideBackdrop')}
            value={hideBackdrop}
            onPress={() => setAppSettings({ hideBackdrop: !hideBackdrop })}
            theme={theme}
          />
          <SwitchSetting
            label={getString('advancedSettingsScreen.useFAB')}
            value={useFabForContinueReading}
            onPress={() =>
              setAppSettings({
                useFabForContinueReading: !useFabForContinueReading,
              })
            }
            theme={theme}
          />
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>
            {getString('appearanceScreen.navbar')}
          </List.SubHeader>
          <SwitchSetting
            label={getString('appearanceScreen.showUpdatesInTheNav')}
            value={showUpdatesTab}
            onPress={() => setAppSettings({ showUpdatesTab: !showUpdatesTab })}
            theme={theme}
          />
          <SwitchSetting
            label={getString('appearanceScreen.showHistoryInTheNav')}
            value={showHistoryTab}
            onPress={() => setAppSettings({ showHistoryTab: !showHistoryTab })}
            theme={theme}
          />
          <SwitchSetting
            label={getString('appearanceScreen.alwaysShowNavLabels')}
            value={showLabelsInNav}
            onPress={() =>
              setAppSettings({ showLabelsInNav: !showLabelsInNav })
            }
            theme={theme}
          />
        </List.Section>
      </ScrollView>

      <ColorPickerModal
        title={getString('appearanceScreen.accentColor')}
        visible={accentColorModal}
        closeModal={hideAccentColorModal}
        color={theme.primary}
        onSubmit={val => setCustomAccentColor(val)}
        theme={theme}
        showAccentColors={true}
      />
    </>
  );
};

export default AppearanceSettings;
