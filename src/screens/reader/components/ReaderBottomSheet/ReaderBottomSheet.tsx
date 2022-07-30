import {
  Animated,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import React, { LegacyRef, useMemo, useState } from 'react';

import Bottomsheet from 'rn-sliding-up-panel';
import {
  useAppDispatch,
  useSettingsV1,
  useTheme,
} from '../../../../redux/hooks';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { getString } from '../../../../../strings/translations';
import { setAppSettings } from '../../../../redux/settings/settings.actions';

import ReaderSheetPreferenceItem from './ReaderSheetPreferenceItem';
import TextSizeSlider from './TextSizeSlider';
import ReaderThemeSelector from './ReaderThemeSelector';
import ReaderTextAlignSelector from './ReaderTextAlignSelector';
import ReaderLineHeight from './ReaderLineHeight';
import ReaderFontPicker from './ReaderFontPicker';

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
    useWebViewForChapter,
    fullScreenMode,
    autoScroll,
    verticalSeekbar,
    showBatteryAndTime,
    showScrollPercentage,
    wvUseVolumeButtons = false,
    swipeGestures = false,
    removeExtraParagraphSpacing = false,
  } = useSettingsV1();

  return (
    <View>
      <ReaderSheetPreferenceItem
        label={getString('readerScreen.bottomSheet.renderHml')}
        onPress={() =>
          dispatch(
            setAppSettings('useWebViewForChapter', !useWebViewForChapter),
          )
        }
        value={useWebViewForChapter}
        theme={theme}
      />
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
        label={'Remove extra paragraph spacing'}
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
      {useWebViewForChapter ? (
        <ReaderSheetPreferenceItem
          label={'Volume buttons scroll'}
          onPress={() =>
            dispatch(setAppSettings('wvUseVolumeButtons', !wvUseVolumeButtons))
          }
          value={wvUseVolumeButtons}
          theme={theme}
        />
      ) : null}
    </View>
  );
};

interface ReaderBottomSheetV2Props {
  bottomSheetRef: LegacyRef<Bottomsheet> | null;
}

const ReaderBottomSheetV2: React.FC<ReaderBottomSheetV2Props> = ({
  bottomSheetRef,
}) => {
  const theme = useTheme();
  // const { bottom: bottomInset } = useSafeAreaInsets();

  const [animatedValue] = useState(new Animated.Value(0));

  const tabHeaderColor = theme.colorPrimary;
  const backgroundColor = theme.colorPrimaryDark;

  const renderScene = SceneMap({
    first: ReaderTab,
    second: GeneralTab,
  });

  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const routes = useMemo(
    () => [
      {
        key: 'first',
        title: getString('moreScreen.settingsScreen.readerSettings.title'),
      },
      {
        key: 'second',
        title: getString('moreScreen.settingsScreen.generalSettings'),
      },
    ],
    [],
  );

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: theme.colorAccent }}
      style={[{ backgroundColor: tabHeaderColor }, styles.tabBar]}
      renderLabel={({ route, color }) => (
        <Text style={{ color }}>{route.title}</Text>
      )}
      inactiveColor={theme.textColorSecondary}
      activeColor={theme.colorAccent}
      pressColor={theme.rippleColor}
    />
  );

  return (
    <Bottomsheet
      animatedValue={animatedValue}
      ref={bottomSheetRef}
      draggableRange={{ top: 600, bottom: 0 }}
      snappingPoints={[0, 400, 600]}
      showBackdrop={true}
      backdropOpacity={0}
      height={600}
    >
      <View style={[styles.bottomSheetContainer, { backgroundColor }]}>
        <TabView
          navigationState={{ index, routes }}
          renderTabBar={renderTabBar}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          style={styles.tabView}
        />
      </View>
    </Bottomsheet>
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
});
