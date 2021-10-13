import React, {useState} from 'react';
import {ScrollView, Text} from 'react-native';

import {useDispatch} from 'react-redux';

import {Appbar} from '../../components/Appbar';
import {ScreenContainer} from '../../components/Common';
import {List} from '../../components/List';
import {ThemePicker} from '../../components/ThemePicker/ThemePicker';
import SwitchSetting from '../../components/Switch/Switch';
import ColorPickerModal from '../../components/ColorPickerModal';

import {useSettings, useTheme} from '../../hooks/reduxHooks';
import {
  setAccentColor,
  setAmoledMode,
  setAppSettings,
  setAppTheme,
  setRippleColor,
} from '../../redux/settings/settings.actions';

import {
  darkTheme,
  greenAppleTheme,
  irisBlueTheme,
  lightTheme,
  midnightDuskTheme,
  oceanicTheme,
  springBlossomTheme,
  strawberryDaiquiri,
  takoLightTheme,
  takoTheme,
  tealTheme,
  yangTheme,
  yinYangTheme,
  yotsubaTheme,
} from '../../theme/theme';

const lightThemes = [
  lightTheme,
  springBlossomTheme,
  takoLightTheme,
  yangTheme,
  yotsubaTheme,
];
const darkThemes = [
  darkTheme,
  midnightDuskTheme,
  strawberryDaiquiri,
  takoTheme,
  greenAppleTheme,
  tealTheme,
  yinYangTheme,
  irisBlueTheme,
  oceanicTheme,
];

const AppearanceSettings = ({navigation}) => {
  const theme = useTheme();
  const dispatch = useDispatch();

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

  const hexToRgb = hex => {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const onSubmit = val => {
    dispatch(setAccentColor(val));
    const rgb = hexToRgb(val);
    const rgbaColor = `rgba(${rgb.r},${rgb.g},${rgb.b},0.12)`;
    dispatch(setRippleColor(rgbaColor));
  };

  return (
    <ScreenContainer theme={theme}>
      <Appbar title="Appearance" onBackAction={navigation.goBack} />
      <ScrollView style={{flex: 1}}>
        <List.Section>
          <List.SubHeader theme={theme}>App theme</List.SubHeader>
          <Text
            style={{
              color: theme.textColorPrimary,
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
                onPress={() => dispatch(setAppTheme(item.id))}
              />
            ))}
          </ScrollView>
          <Text
            style={{
              color: theme.textColorPrimary,
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
                onPress={() => dispatch(setAppTheme(item.id))}
              />
            ))}
          </ScrollView>
          {theme.statusBar === 'light-content' && (
            <SwitchSetting
              label="Pure black dark mode"
              value={
                theme.colorPrimary === '#000000' &&
                theme.colorPrimaryDark === '#000000'
              }
              onPress={() =>
                dispatch(
                  setAmoledMode(
                    theme.id,
                    !(
                      theme.colorPrimary === '#000000' &&
                      theme.colorPrimaryDark === '#000000'
                    ),
                  ),
                )
              }
              theme={theme}
            />
          )}
          <List.ColorItem
            title="Accent Color"
            description={theme.colorAccent.toUpperCase()}
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
        modalVisible={accentColorModal}
        hideModal={hideAccentColorModal}
        color={theme.colorAccent}
        onSubmit={onSubmit}
        theme={theme}
        showAccentColors={true}
      />
    </ScreenContainer>
  );
};

export default AppearanceSettings;
