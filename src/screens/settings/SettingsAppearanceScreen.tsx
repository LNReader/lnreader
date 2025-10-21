import React, { useMemo, useState } from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';

import { ThemePicker } from '@components/ThemePicker/ThemePicker';
import type { SegmentedControlOption } from '@components/SegmentedControl';
import SettingSwitch from './components/SettingSwitch';
import ColorPickerModal from '@components/ColorPickerModal/ColorPickerModal';

import { useAppSettings, useTheme } from '@hooks/persisted';
import {
  useMMKVBoolean,
  useMMKVNumber,
  useMMKVString,
} from 'react-native-mmkv';
import { Appbar, List, SafeAreaView, SegmentedControl } from '@components';
import { AppearanceSettingsScreenProps } from '@navigators/types';
import { getString } from '@strings/translations';
import { darkThemes, lightThemes } from '@theme/md3';
import { ThemeColors } from '@theme/types';

type ThemeMode = 'light' | 'dark' | 'system';

const AppearanceSettings = ({ navigation }: AppearanceSettingsScreenProps) => {
  const theme = useTheme();
  const [, setThemeId] = useMMKVNumber('APP_THEME_ID');
  const [themeMode = 'system', setThemeMode] = useMMKVString('THEME_MODE');
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

  const currentMode = themeMode as ThemeMode;

  /**
   * Accent Color Modal
   */
  const [accentColorModal, setAccentColorModal] = useState(false);
  const showAccentColorModal = () => setAccentColorModal(true);
  const hideAccentColorModal = () => setAccentColorModal(false);

  const themeModeOptions: SegmentedControlOption<ThemeMode>[] = useMemo(
    () => [
      {
        value: 'system',
        label: getString('appearanceScreen.themeModeSystem'),
      },
      {
        value: 'light',
        label: getString('appearanceScreen.themeModeLight'),
      },
      {
        value: 'dark',
        label: getString('appearanceScreen.themeModeDark'),
      },
    ],
    [],
  );

  const handleModeChange = (mode: ThemeMode) => {
    setThemeMode(mode);

    if (mode !== 'system') {
      const themes = mode === 'dark' ? darkThemes : lightThemes;
      const currentThemeInMode = themes.find(t => t.id === theme.id);

      if (!currentThemeInMode) {
        setThemeId(themes[0].id);
      }
    }
  };

  const handleThemeSelect = (selectedTheme: ThemeColors) => {
    setThemeId(selectedTheme.id);
    setCustomAccentColor(undefined);

    if (currentMode !== 'system') {
      setThemeMode(selectedTheme.isDark ? 'dark' : 'light');
    }
  };

  return (
    <SafeAreaView excludeTop>
      <Appbar
        title={getString('appearance')}
        handleGoBack={navigation.goBack}
        theme={theme}
      />
      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.scrollContent}
      >
        <List.Section>
          <List.SubHeader theme={theme}>
            {getString('appearanceScreen.appTheme')}
          </List.SubHeader>

          {/* Theme Mode Selector */}
          <View style={styles.segmentedControlContainer}>
            <SegmentedControl
              options={themeModeOptions}
              value={currentMode}
              onChange={handleModeChange}
              theme={theme}
            />
          </View>

          {/* Light Themes */}
          <Text style={[{ color: theme.onSurface }, styles.themeSectionText]}>
            {getString('appearanceScreen.lightTheme')}
          </Text>
          <ScrollView
            contentContainerStyle={styles.themePickerRow}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          >
            {lightThemes.map(item => (
              <ThemePicker
                horizontal
                key={item.id}
                currentTheme={theme}
                theme={item}
                onPress={() => handleThemeSelect(item)}
              />
            ))}
          </ScrollView>

          {/* Dark Themes */}
          <Text style={[{ color: theme.onSurface }, styles.themeSectionText]}>
            {getString('appearanceScreen.darkTheme')}
          </Text>
          <ScrollView
            contentContainerStyle={styles.themePickerRow}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          >
            {darkThemes.map(item => (
              <ThemePicker
                horizontal
                key={item.id}
                currentTheme={theme}
                theme={item}
                onPress={() => handleThemeSelect(item)}
              />
            ))}
          </ScrollView>

          {theme.isDark ? (
            <SettingSwitch
              label={getString('appearanceScreen.pureBlackDarkMode')}
              value={isAmoledBlack}
              onPress={() => setAmoledBlack(prevVal => !prevVal)}
              theme={theme}
            />
          ) : null}
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
          <SettingSwitch
            label={getString('appearanceScreen.hideBackdrop')}
            value={hideBackdrop}
            onPress={() => setAppSettings({ hideBackdrop: !hideBackdrop })}
            theme={theme}
          />
          <SettingSwitch
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
          <SettingSwitch
            label={getString('appearanceScreen.showUpdatesInTheNav')}
            value={showUpdatesTab}
            onPress={() => setAppSettings({ showUpdatesTab: !showUpdatesTab })}
            theme={theme}
          />
          <SettingSwitch
            label={getString('appearanceScreen.showHistoryInTheNav')}
            value={showHistoryTab}
            onPress={() => setAppSettings({ showHistoryTab: !showHistoryTab })}
            theme={theme}
          />
          <SettingSwitch
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
    </SafeAreaView>
  );
};

export default AppearanceSettings;

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  themeSectionText: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  themePickerRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
  },
  segmentedControlContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
