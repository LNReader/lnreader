import {FlatList, StyleSheet, View} from 'react-native';
import React, {useMemo} from 'react';
import {useNavigation} from '@react-navigation/native';

import {
  Appbar,
  List,
  ScrollContainer,
  SwitchItem,
  Text,
  ThemePicker,
} from '../../../components';

import {defaultLightTheme} from '../../../theme/light';
import {
  defaultDarkTheme,
  greenAppleDark,
  midnightDuskDark,
  strawberryDaiquiriDark,
} from '../../../theme/dark';

import {useAppDispatch, useAppearanceSettings} from '../../../redux/hooks';
import {
  setAmoledMode,
  setTheme,
  toggleShowHistoryTab,
  toggleShowLabelsInNav,
  toggleShowUpdatesTab,
} from '../../../redux/settings/settingsSlice';
import {ColorScheme, ThemeType} from '../../../theme/types';

const darkThemes = [
  defaultDarkTheme,
  greenAppleDark,
  midnightDuskDark,
  strawberryDaiquiriDark,
];

const lightThemes = [defaultLightTheme];

const SettingsAppearance = () => {
  const {goBack} = useNavigation();
  const {theme, showUpdatesTab, showHistoryTab, showLabelsInNav} =
    useAppearanceSettings();

  const dispatch = useAppDispatch();

  const renderThemePicker = ({item}: {item: ThemeType}) => (
    <ThemePicker
      theme={item}
      currentTheme={theme}
      onPress={() => dispatch(setTheme(item))}
    />
  );

  const isAmoled =
    theme.background === '#000000' && theme.surface === '#000000';

  return (
    <>
      <Appbar title="Appearance" handleGoBack={goBack} theme={theme} />
      <ScrollContainer>
        <List.Section>
          <List.SubHeader theme={theme}>App theme</List.SubHeader>
          <Text padding={16} color={theme.textColorPrimary}>
            Light themes
          </Text>
          <FlatList
            contentContainerStyle={styles.themePickerContainer}
            data={lightThemes}
            horizontal
            keyExtractor={item => item.id.toString()}
            renderItem={renderThemePicker}
            showsHorizontalScrollIndicator={false}
          />
          <Text padding={16} color={theme.textColorPrimary}>
            Dark themes
          </Text>
          <FlatList
            contentContainerStyle={styles.themePickerContainer}
            data={darkThemes}
            horizontal
            keyExtractor={item => item.id.toString()}
            renderItem={renderThemePicker}
            showsHorizontalScrollIndicator={false}
          />
          {theme.type === ColorScheme.DARK ? (
            <SwitchItem
              label="Pure black dark mode"
              value={isAmoled}
              onPress={() => dispatch(setAmoledMode())}
              theme={theme}
            />
          ) : null}
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>Navbar</List.SubHeader>
          <SwitchItem
            label="Show updates in the nav"
            value={showUpdatesTab}
            onPress={() => dispatch(toggleShowUpdatesTab())}
            theme={theme}
          />
          <SwitchItem
            label="Show history in the nav"
            value={showHistoryTab}
            onPress={() => dispatch(toggleShowHistoryTab())}
            theme={theme}
          />
          <SwitchItem
            label="Always show nav labels"
            value={showLabelsInNav}
            onPress={() => dispatch(toggleShowLabelsInNav())}
            theme={theme}
          />
        </List.Section>
      </ScrollContainer>
    </>
  );
};

export default SettingsAppearance;

const styles = StyleSheet.create({
  themePickerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
