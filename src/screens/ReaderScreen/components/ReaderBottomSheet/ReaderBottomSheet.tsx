import React, {useState} from 'react';
import {
  Animated,
  FlatList,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';

import Bottomsheet from 'rn-sliding-up-panel';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {ThemeType} from '../../../../theme/types';
import {presetReaderThemes} from '../../../../theme/reader/presets';
import {
  ReaderBottomSheetSwitch,
  ReaderFontToggleButton,
  ReaderThemeToggleButton,
} from '..';
import {
  useAppDispatch,
  useReaderSettings,
  useTheme,
} from '../../../../redux/hooks';
import {
  setReaderFont,
  setReaderFontSize,
  setReaderLineHeight,
  setReaderPadding,
  setReaderTheme,
  toggleReaderFullScreenMode,
} from '../../../../redux/settings/settingsSlice';
import {fonts} from '../../../../theme/reader/fonts';
import {IconButton} from '../../../../components';

interface ReaderBottomSheetProps {
  bottomSheetRef: any;
  theme: ThemeType;
}

const AppearanceTab = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const {
    backgroundColor,
    textColor,
    fontFamily,
    paddingHorizontal,
    fontSize,
    lineHeight,
  } = useReaderSettings();

  return (
    <View style={styles.generalTab}>
      <View style={styles.container}>
        <Text style={{color: theme.onSurface}}>Themes</Text>
        <FlatList
          horizontal
          style={styles.themesList}
          showsHorizontalScrollIndicator={false}
          data={presetReaderThemes}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <ReaderThemeToggleButton
              readerTheme={item}
              selected={
                item.backgroundColor === backgroundColor &&
                item.textColor === textColor
              }
              onPress={() =>
                dispatch(
                  setReaderTheme({
                    backgroundColor: item.backgroundColor,
                    textColor: item.textColor,
                  }),
                )
              }
            />
          )}
        />
      </View>
      <View style={styles.container}>
        <Text style={{color: theme.onSurface}}>Fonts</Text>
        <FlatList
          horizontal
          style={styles.fontsList}
          showsHorizontalScrollIndicator={false}
          data={fonts}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <ReaderFontToggleButton
              readerFont={item}
              theme={theme}
              selected={item.fontFamily === fontFamily}
              onPress={() =>
                dispatch(
                  setReaderFont({
                    fontFamily: item.fontFamily,
                  }),
                )
              }
            />
          )}
        />
      </View>
      <View style={styles.container}>
        <Text style={{color: theme.onSurface}}>Padding</Text>
        <View style={styles.paddingContainer}>
          <IconButton
            name="minus"
            theme={theme}
            disabled={paddingHorizontal <= 0}
            onPress={() =>
              dispatch(
                setReaderPadding({
                  paddingHorizontal: paddingHorizontal - 1,
                }),
              )
            }
          />
          <Text
            style={[styles.valueText, {color: theme.onSurface}]}
          >{`${paddingHorizontal}%`}</Text>
          <IconButton
            name="plus"
            theme={theme}
            disabled={paddingHorizontal >= 10}
            onPress={() =>
              dispatch(
                setReaderPadding({
                  paddingHorizontal: paddingHorizontal + 1,
                }),
              )
            }
          />
        </View>
      </View>
      <View style={styles.container}>
        <Text style={{color: theme.onSurface}}>Font size</Text>
        <View style={styles.paddingContainer}>
          <IconButton
            name="minus"
            theme={theme}
            disabled={fontSize <= 1}
            onPress={() =>
              dispatch(
                setReaderFontSize({
                  fontSize: fontSize - 1,
                }),
              )
            }
          />
          <Text style={[styles.valueText, {color: theme.onSurface}]}>
            {fontSize}
          </Text>
          <IconButton
            name="plus"
            theme={theme}
            onPress={() =>
              dispatch(
                setReaderFontSize({
                  fontSize: fontSize + 1,
                }),
              )
            }
          />
        </View>
      </View>
      <View style={styles.container}>
        <Text style={{color: theme.onSurface}}>Line height</Text>
        <View style={styles.paddingContainer}>
          <IconButton
            name="minus"
            theme={theme}
            disabled={lineHeight <= 1.3}
            onPress={() =>
              dispatch(
                setReaderLineHeight({
                  lineHeight: lineHeight - 0.1,
                }),
              )
            }
          />
          <Text style={[styles.valueText, {color: theme.onSurface}]}>{`${
            Math.round(lineHeight * 10) / 10
          }%`}</Text>
          <IconButton
            name="plus"
            theme={theme}
            disabled={lineHeight >= 2}
            onPress={() =>
              dispatch(
                setReaderLineHeight({
                  lineHeight: lineHeight + 0.1,
                }),
              )
            }
          />
        </View>
      </View>
    </View>
  );
};

const GeneralTab = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const {fullScreenMode} = useReaderSettings();

  return (
    <>
      <ReaderBottomSheetSwitch
        label="Fullscreen"
        value={fullScreenMode}
        onPress={() => dispatch(toggleReaderFullScreenMode())}
        theme={theme}
      />
    </>
  );
};

const ReaderBottomSheet: React.FC<ReaderBottomSheetProps> = ({
  bottomSheetRef,
  theme,
}) => {
  const {bottom} = useSafeAreaInsets();

  const [animatedValue] = useState(new Animated.Value(0));

  const renderScene = SceneMap({
    first: AppearanceTab,
    second: GeneralTab,
  });

  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'first', title: 'Appearance'},
    {key: 'second', title: 'General'},
  ]);

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{backgroundColor: theme.primary}}
      style={[
        styles.tabBarStyle,
        {
          backgroundColor: theme.surface,
          borderBottomColor: theme.divider,
        },
      ]}
      renderLabel={({route, color}) => (
        <Text style={{color}}>{route.title}</Text>
      )}
      inactiveColor={theme.textColorSecondary}
      activeColor={theme.primary}
      pressColor={theme.rippleColor}
    />
  );

  return (
    <Bottomsheet
      ref={bottomSheetRef}
      animatedValue={animatedValue}
      draggableRange={{top: 400, bottom: 0}}
      snappingPoints={[0, 400]}
      showBackdrop={true}
      backdropOpacity={0}
      height={400}
    >
      <View
        style={[
          styles.sheetContainer,
          {
            backgroundColor: theme.surface,
            paddingBottom: bottom,
          },
        ]}
      >
        <TabView
          navigationState={{index, routes}}
          renderTabBar={renderTabBar}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{width: layout.width}}
          style={styles.tabView}
        />
      </View>
    </Bottomsheet>
  );
};

export default ReaderBottomSheet;

const styles = StyleSheet.create({
  sheetContainer: {
    flex: 1,
    zIndex: 3,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tabBarStyle: {
    elevation: 0,
    borderBottomWidth: 1,
  },
  tabView: {
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
  },
  header: {
    padding: 16,
  },
  generalTab: {
    paddingVertical: 16,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themesList: {
    flexDirection: 'row-reverse',
  },
  fontsList: {
    marginLeft: 16,
    flexDirection: 'row',
  },
  paddingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 16,
    marginHorizontal: 16,
  },
});
