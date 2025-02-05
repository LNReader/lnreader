import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import React, { RefObject, useMemo, useState, useCallback } from 'react';
import color from 'color';

import { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import BottomSheet from '@components/BottomSheet/BottomSheet';
import { useChapterGeneralSettings, useTheme } from '@hooks/persisted';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { getString } from '@strings/translations';

import ReaderSheetPreferenceItem from './ReaderSheetPreferenceItem';
import TextSizeSlider from './TextSizeSlider';
import ReaderThemeSelector from './ReaderThemeSelector';
import ReaderTextAlignSelector from './ReaderTextAlignSelector';
import ReaderValueChange from './ReaderValueChange';
import ReaderFontPicker from './ReaderFontPicker';
import { overlay } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { StringMap } from '@strings/types';

const ReaderTab: React.FC = () => (
  <View style={styles.readerTab}>
    <TextSizeSlider />
    <ReaderThemeSelector />
    <ReaderTextAlignSelector />
    <ReaderValueChange
      label={getString('readerScreen.bottomSheet.lineHeight')}
      valueKey="lineHeight"
    />
    <ReaderValueChange
      label={getString('readerScreen.bottomSheet.padding')}
      valueKey="padding"
      valueChange={2}
      min={0}
      max={50}
      decimals={0}
      unit="px"
    />
    <ReaderFontPicker />
  </View>
);

const GeneralTab: React.FC = () => {
  const theme = useTheme();
  const { setChapterGeneralSettings, ...settings } =
    useChapterGeneralSettings();

  const toggleSetting = useCallback(
    (key: keyof typeof settings) =>
      setChapterGeneralSettings({ [key]: !settings[key] }),
    [setChapterGeneralSettings, settings],
  );

  const preferences = useMemo(
    () => [
      { key: 'fullScreenMode', label: 'fullscreen' },
      { key: 'autoScroll', label: 'autoscroll' },
      { key: 'verticalSeekbar', label: 'verticalSeekbar' },
      { key: 'showBatteryAndTime', label: 'showBatteryAndTime' },
      { key: 'showScrollPercentage', label: 'showProgressPercentage' },
      { key: 'swipeGestures', label: 'swipeGestures' },
      { key: 'pageReader', label: 'pageReader' },
      { key: 'removeExtraParagraphSpacing', label: 'removeExtraSpacing' },
      { key: 'useVolumeButtons', label: 'volumeButtonsScroll' },
      { key: 'bionicReading', label: 'bionicReading' },
      { key: 'tapToScroll', label: 'tapToScroll' },
      { key: 'keepScreenOn', label: 'keepScreenOn' },
    ],
    [],
  );

  return (
    <BottomSheetScrollView showsVerticalScrollIndicator={false}>
      {preferences.map(({ key, label }) => (
        <ReaderSheetPreferenceItem
          key={key}
          label={getString(
            `readerScreen.bottomSheet.${label}` as keyof StringMap,
          )}
          onPress={() => toggleSetting(key as keyof typeof settings)} // @ts-ignore
          value={settings[key as keyof typeof settings]}
          theme={theme}
        />
      ))}
    </BottomSheetScrollView>
  );
};

interface ReaderBottomSheetV2Props {
  bottomSheetRef: RefObject<BottomSheetModalMethods> | null;
}

const routes = [
  { key: 'readerTab', title: getString('readerSettings.title') },
  { key: 'generalTab', title: getString('generalSettings') },
];

const ReaderBottomSheetV2: React.FC<ReaderBottomSheetV2Props> = ({
  bottomSheetRef,
}) => {
  const theme = useTheme();
  const { bottom } = useSafeAreaInsets();
  const layout = useWindowDimensions();

  const tabHeaderColor = overlay(2, theme.surface);
  const backgroundColor = tabHeaderColor;

  const renderScene = useMemo(
    () => SceneMap({ readerTab: ReaderTab, generalTab: GeneralTab }),
    [],
  );

  const [index, setIndex] = useState(0);

  const renderTabBar = useCallback(
    (props: any) => (
      <TabBar
        {...props}
        indicatorStyle={{ backgroundColor: theme.primary }}
        style={[styles.tabBar, { backgroundColor: tabHeaderColor }]}
        inactiveColor={theme.onSurfaceVariant}
        activeColor={theme.primary}
        pressColor={color(theme.primary).alpha(0.12).string()}
      />
    ),
    [theme, tabHeaderColor],
  );

  return (
    <BottomSheet
      bottomSheetRef={bottomSheetRef}
      snapPoints={[360, 600]}
      backgroundStyle={{ backgroundColor }}
      bottomInset={bottom}
      containerStyle={styles.container}
    >
      <BottomSheetView style={{ flex: 1 }}>
        <TabView
          commonOptions={{
            label: ({ route, color }) => (
              <Text style={{ color }}>{route.title}</Text>
            ),
          }}
          navigationState={{ index, routes }}
          renderTabBar={renderTabBar}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          style={styles.tabView}
        />
      </BottomSheetView>
    </BottomSheet>
  );
};

export default React.memo(ReaderBottomSheetV2);

const styles = StyleSheet.create({
  tabView: {
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
  },
  tabBar: {
    elevation: 0,
    borderBottomWidth: 0.5,
  },
  container: {
    borderRadius: 8,
  },
  readerTab: {
    paddingVertical: 8,
  },
});
