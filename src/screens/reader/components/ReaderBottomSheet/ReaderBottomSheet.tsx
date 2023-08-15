import {
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  TextInput,
} from 'react-native';
import React, { Ref, useMemo, useState } from 'react';
import color from 'color';

import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { defaultTo } from 'lodash-es';
import BottomSheet from '@components/BottomSheet/BottomSheet';
import { useAppDispatch, useSettingsV1 } from '../../../../redux/hooks';
import { useTheme } from '@hooks/useTheme';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { getString } from '../../../../../strings/translations';
import { setAppSettings } from '../../../../redux/settings/settings.actions';

import ReaderSheetPreferenceItem from './ReaderSheetPreferenceItem';
import TextSizeSlider from './TextSizeSlider';
import ReaderThemeSelector from './ReaderThemeSelector';
import ReaderTextAlignSelector from './ReaderTextAlignSelector';
import ReaderLineHeight from './ReaderLineHeight';
import ReaderFontPicker from './ReaderFontPicker';
import { overlay } from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ReaderTab: React.FC = () => {
  return (
    <View style={styles.readerTab}>
      <TextSizeSlider />
      <ReaderThemeSelector />
      <ReaderTextAlignSelector />
      <ReaderLineHeight />
      <ReaderFontPicker />
    </View>
  );
};

const GeneralTab: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const {
    fullScreenMode,
    autoScroll,
    verticalSeekbar,
    showBatteryAndTime,
    showScrollPercentage,
    useVolumeButtons = false,
    scrollAmount = 200,
    swipeGestures = false,
    readerPages = false,
    removeExtraParagraphSpacing = false,
    addChapterNameInReader = false,
    bionicReading = false,
  } = useSettingsV1();

  return (
    <ScrollView>
      <ReaderSheetPreferenceItem
        label={getString('readerScreen.bottomSheet.fullscreen')}
        onPress={() =>
          dispatch(setAppSettings('fullScreenMode', !fullScreenMode))
        }
        value={fullScreenMode}
        theme={theme}
      />
      <ReaderSheetPreferenceItem
        label={getString('readerScreen.bottomSheet.autoscroll')}
        onPress={() => dispatch(setAppSettings('autoScroll', !autoScroll))}
        value={autoScroll}
        theme={theme}
      />
      <ReaderSheetPreferenceItem
        label={getString('readerScreen.bottomSheet.verticalSeekbar')}
        onPress={() =>
          dispatch(setAppSettings('verticalSeekbar', !verticalSeekbar))
        }
        value={verticalSeekbar}
        theme={theme}
      />
      <ReaderSheetPreferenceItem
        label={getString('readerScreen.bottomSheet.showBatteryAndTime')}
        onPress={() =>
          dispatch(setAppSettings('showBatteryAndTime', !showBatteryAndTime))
        }
        value={showBatteryAndTime}
        theme={theme}
      />
      <ReaderSheetPreferenceItem
        label={getString('readerScreen.bottomSheet.showProgressPercentage')}
        onPress={() =>
          dispatch(
            setAppSettings('showScrollPercentage', !showScrollPercentage),
          )
        }
        value={showScrollPercentage}
        theme={theme}
      />
      <ReaderSheetPreferenceItem
        label={getString('readerScreen.bottomSheet.swipeGestures')}
        onPress={() =>
          dispatch(setAppSettings('swipeGestures', !swipeGestures))
        }
        value={swipeGestures}
        theme={theme}
      />
      <ReaderSheetPreferenceItem
        label={getString('readerScreen.bottomSheet.readerPages')}
        onPress={() => dispatch(setAppSettings('readerPages', !readerPages))}
        value={readerPages}
        theme={theme}
      />
      <ReaderSheetPreferenceItem
        label={getString('readerScreen.bottomSheet.removeExtraSpacing')}
        onPress={() =>
          dispatch(
            setAppSettings(
              'removeExtraParagraphSpacing',
              !removeExtraParagraphSpacing,
            ),
          )
        }
        value={removeExtraParagraphSpacing}
        theme={theme}
      />
      <ReaderSheetPreferenceItem
        label={getString('readerScreen.bottomSheet.volumeButtonsScroll')}
        onPress={() =>
          dispatch(setAppSettings('useVolumeButtons', !useVolumeButtons))
        }
        value={useVolumeButtons}
        theme={theme}
      />
      {useVolumeButtons ? (
        <View style={styles.textFieldContainer}>
          <Text style={[styles.paddingRightM]} numberOfLines={2}>
            {getString('readerScreen.bottomSheet.scrollAmount')}
          </Text>
          <TextInput
            style={styles.textField}
            defaultValue={defaultTo(scrollAmount, 200).toString()}
            keyboardType="numeric"
            onChangeText={text => {
              if (text) {
                dispatch(setAppSettings('scrollAmount', Number(text)));
              }
            }}
          />
        </View>
      ) : null}
      <ReaderSheetPreferenceItem
        label={'Add chapter name in reader'}
        onPress={() =>
          dispatch(
            setAppSettings('addChapterNameInReader', !addChapterNameInReader),
          )
        }
        value={addChapterNameInReader}
        theme={theme}
      />
      <ReaderSheetPreferenceItem
        label={getString('readerScreen.bottomSheet.bionicReading')}
        onPress={() =>
          dispatch(setAppSettings('bionicReading', !bionicReading))
        }
        value={bionicReading}
        theme={theme}
      />
    </ScrollView>
  );
};
interface ReaderBottomSheetV2Props {
  bottomSheetRef: Ref<BottomSheetModal> | null;
}

const ReaderBottomSheetV2: React.FC<ReaderBottomSheetV2Props> = ({
  bottomSheetRef,
}) => {
  const theme = useTheme();

  const tabHeaderColor = overlay(2, theme.surface);
  const backgroundColor = tabHeaderColor;

  const renderScene = SceneMap({
    'readerTab': ReaderTab,
    'generalTab': GeneralTab,
  });

  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const routes = useMemo(
    () => [
      {
        key: 'readerTab',
        title: getString('moreScreen.settingsScreen.readerSettings.title'),
      },
      {
        key: 'generalTab',
        title: getString('moreScreen.settingsScreen.generalSettings'),
      },
    ],
    [],
  );

  const renderTabBar = (props: any) => {
    return (
      <TabBar
        {...props}
        indicatorStyle={{ backgroundColor: theme.primary }}
        style={[
          {
            backgroundColor: tabHeaderColor,
            borderBottomColor: theme.outline,
            borderBottomWidth: 1,
          },
          styles.tabBar,
        ]}
        renderLabel={({ route, color }) => (
          <Text style={{ color }}>{route.title}</Text>
        )}
        inactiveColor={theme.onSurfaceVariant}
        activeColor={theme.primary}
        pressColor={color(theme.primary).alpha(0.12).string()}
      />
    );
  };
  const { bottom } = useSafeAreaInsets();
  return (
    <BottomSheet bottomSheetRef={bottomSheetRef} snapPoints={[360, 600]}>
      <BottomSheetScrollView
        contentContainerStyle={[
          styles.bottomSheetContainer,
          { backgroundColor },
          { marginBottom: bottom },
        ]}
      >
        <TabView
          navigationState={{ index, routes }}
          renderTabBar={renderTabBar}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          style={styles.tabView}
        />
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

export default ReaderBottomSheetV2;

const styles = StyleSheet.create({
  bottomSheetContainer: {
    flex: 1,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tabView: {
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
  },
  tabBar: {
    elevation: 0,
  },
  readerTab: {
    paddingVertical: 8,
  },
  textFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textField: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 100,
    textAlign: 'right',
  },
  paddingRightM: {
    flex: 1,
    paddingRight: 16,
  },
});
