import React, { useState } from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';

import { ThemePicker } from '@components/ThemePicker/ThemePicker';
import SettingSwitch from './components/SettingSwitch';
import ColorPickerModal from '@components/ColorPickerModal/ColorPickerModal';

import { useAppSettings } from '@hooks/persisted';
import { useTheme } from '@providers/Providers';
import {
  useMMKVBoolean,
  useMMKVObject,
  useMMKVString,
} from 'react-native-mmkv';
import { Appbar, List, SafeAreaView } from '@components';
import { AppearanceSettingsScreenProps } from '@navigators/types';
import { getString } from '@strings/translations';
import { darkThemes, lightThemes } from '@theme/md3';

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
                onPress={() => {
                  setTheme(item);
                  setCustomAccentColor(undefined);
                }}
              />
            ))}
          </ScrollView>
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
                onPress={() => {
                  setTheme(item);
                  setCustomAccentColor(undefined);
                }}
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
});
