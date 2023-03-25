import React, { useState } from 'react';
import { ScrollView, Text } from 'react-native';

import { useDispatch } from 'react-redux';

import { ThemePicker } from '../../components/ThemePicker/ThemePicker';
import SwitchSetting from '../../components/Switch/Switch';
import ColorPickerModal from '../../components/ColorPickerModal/ColorPickerModal';

import { useSettings } from '../../hooks/reduxHooks';
import { useTheme } from '@hooks/useTheme';
import { setAppSettings } from '../../redux/settings/settings.actions';
import {
  defaultTheme,
  midnightDusk,
  tealTurquoise,
  yotsubaTheme,
  lavenderTheme,
  strawberryDaiquiriTheme,
  takoTheme,
} from '../../theme/md3';

import {
  useMMKVBoolean,
  useMMKVObject,
  useMMKVString,
} from 'react-native-mmkv';
import { Appbar, List } from '@components';

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

const AppearanceSettings = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [, setTheme] = useMMKVObject('APP_THEME');
  const [isAmoledBlack, setAmoledBlack] = useMMKVBoolean('AMOLED_BLACK');
  const [, setCustomAccentColor] = useMMKVString('CUSTOM_ACCENT_COLOR');

  const {
    showHistoryTab = true,
    showUpdatesTab = true,
    showLabelsInNav = false,
    hideBackdrop = false,
    useFabForContinueReading = false,
  } = useSettings();

  /**
   * Accent Color Modal
   */
  const [accentColorModal, setAccentColorModal] = useState(false);
  const showAccentColorModal = () => setAccentColorModal(true);
  const hideAccentColorModal = () => setAccentColorModal(false);

  return (
    <>
      <Appbar
        title="Appearance"
        handleGoBack={navigation.goBack}
        theme={theme}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <List.Section>
          <List.SubHeader theme={theme}>App theme</List.SubHeader>
          <Text
            style={{
              color: theme.onSurface,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            Light Theme
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
            Dark Theme
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
              label="Pure black dark mode"
              value={isAmoledBlack}
              onPress={() => setAmoledBlack(prevVal => !prevVal)}
              theme={theme}
            />
          )}
          <List.ColorItem
            title="Accent Color"
            description={theme.primary.toUpperCase()}
            onPress={showAccentColorModal}
            theme={theme}
          />
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>Novel info</List.SubHeader>
          <SwitchSetting
            label="Hide backdrop"
            value={hideBackdrop}
            onPress={() =>
              dispatch(setAppSettings('hideBackdrop', !hideBackdrop))
            }
            theme={theme}
          />
          <SwitchSetting
            label="Use FAB instead of button"
            value={useFabForContinueReading}
            onPress={() =>
              dispatch(
                setAppSettings(
                  'useFabForContinueReading',
                  !useFabForContinueReading,
                ),
              )
            }
            theme={theme}
          />
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>Navbar</List.SubHeader>
          <SwitchSetting
            label="Show updates in the nav"
            value={showUpdatesTab}
            onPress={() =>
              dispatch(setAppSettings('showUpdatesTab', !showUpdatesTab))
            }
            theme={theme}
          />
          <SwitchSetting
            label="Show history in the nav"
            value={showHistoryTab}
            onPress={() =>
              dispatch(setAppSettings('showHistoryTab', !showHistoryTab))
            }
            theme={theme}
          />
          <SwitchSetting
            label="Always show nav labels"
            value={showLabelsInNav}
            onPress={() =>
              dispatch(setAppSettings('showLabelsInNav', !showLabelsInNav))
            }
            theme={theme}
          />
        </List.Section>
      </ScrollView>

      <ColorPickerModal
        title="Accent color"
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
