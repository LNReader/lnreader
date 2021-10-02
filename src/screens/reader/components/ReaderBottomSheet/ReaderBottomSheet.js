import React, {memo, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Animated,
} from 'react-native';

import Slider from '@react-native-community/slider';
import {IconButton, Switch} from 'react-native-paper';
import Bottomsheet from 'rn-sliding-up-panel';

import BottomSheetHandle from '../../../../components/BottomSheetHandle';
import {Row} from '../../../../components/Common';

import {fonts} from '../../../../services/utils/constants';

import {
  setAppSettings,
  setReaderSettings,
} from '../../../../redux/settings/settings.actions';
import {
  ToggleButton,
  ToggleColorButton,
} from '../../../../components/Common/ToggleButton';
import {ReaderBottomSheetSwitch} from './components/ReaderBottomSheetSwitch';
import {ReaderBottomSheetFontPicker} from './components/ReaderBottomSheetFontPicker';

const ReaderSheet = ({
  theme,
  reader,
  dispatch,
  navigation,
  bottomSheetRef,
  showBatteryAndTime,
  selectText,
  autoScroll,
  useWebViewForChapter,
  showScrollPercentage,
  swipeGestures,
  enableSwipeGestures,
  fullScreenMode,
}) => {
  const [animatedValue] = useState(new Animated.Value(0));

  const presetThemes = [
    {value: 2, backgroundColor: '#f5f5fa', textColor: '#111111'},
    {value: 3, backgroundColor: '#F7DFC6', textColor: '#593100'},
    {value: 6, backgroundColor: '#dce5e2', textColor: '#000000'},
    {value: 4, backgroundColor: '#292832', textColor: '#CCCCCC'},
    {
      value: 1,
      backgroundColor: '#000000',
      textColor: 'rgba(255,255,255,0.7)',
    },
  ];

  const textAlignments = [
    {value: 'left', icon: 'format-align-left'},
    {value: 'center', icon: 'format-align-center'},
    {value: 'justify', icon: 'format-align-justify'},
    {value: 'right', icon: 'format-align-right'},
  ];

  return (
    <Bottomsheet
      animatedValue={animatedValue}
      ref={bottomSheetRef}
      draggableRange={{top: 390, bottom: 0}}
      snappingPoints={[0, 390]}
      showBackdrop={true}
      backdropOpacity={0}
      height={390}
    >
      <ScrollView
        style={[
          styles.contentContainer,
          {backgroundColor: theme.colorPrimaryDark},
        ]}
      >
        <BottomSheetHandle theme={theme} />
        <View style={{flex: 1, paddingVertical: 16, paddingTop: 24}}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: theme.textColorSecondary,
                paddingHorizontal: 16,
                textAlign: 'center',
              }}
            >
              Text size
            </Text>
            <Slider
              style={{
                flex: 1,
                height: 40,
              }}
              value={reader.textSize}
              minimumValue={12}
              maximumValue={20}
              step={1}
              minimumTrackTintColor={theme.colorAccent}
              maximumTrackTintColor="#000000"
              thumbTintColor={theme.colorAccent}
              onSlidingComplete={value =>
                dispatch(setReaderSettings('textSize', value))
              }
            />
          </View>

          <View style={{paddingLeft: 16, paddingRight: 8}}>
            <Row
              style={{
                justifyContent: 'space-between',
                marginVertical: 6,
              }}
            >
              <Text style={{color: theme.textColorSecondary}}>Color</Text>
              <View style={{marginLeft: 16}}>
                <ScrollView horizontal={true}>
                  {presetThemes.map((item, index) => (
                    <ToggleColorButton
                      key={index}
                      selected={reader.theme === item.value}
                      backgroundColor={item.backgroundColor}
                      textColor={item.textColor}
                      theme={theme}
                      onPress={() => {
                        dispatch(setReaderSettings('theme', item.value));
                        dispatch(
                          setReaderSettings('textColor', item.textColor),
                        );
                      }}
                    />
                  ))}
                </ScrollView>
              </View>
            </Row>
            <Row
              style={{
                justifyContent: 'space-between',
                marginVertical: 6,
              }}
            >
              <Text style={{color: theme.textColorSecondary}}>Text align</Text>
              <Row>
                {textAlignments.map(item => (
                  <ToggleButton
                    key={item.value}
                    selected={item.value === reader.textAlign}
                    icon={item.icon}
                    theme={theme}
                    onPress={() =>
                      dispatch(setReaderSettings('textAlign', item.value))
                    }
                  />
                ))}
              </Row>
            </Row>
            <Row
              style={{
                justifyContent: 'space-between',
                marginVertical: 6,
              }}
            >
              <Text style={{color: theme.textColorSecondary}}>Padding</Text>
              <Row>
                <IconButton
                  icon="minus"
                  color={theme.colorAccent}
                  size={26}
                  disabled={reader.padding <= 0 ? true : false}
                  onPress={() =>
                    dispatch(setReaderSettings('padding', reader.padding - 1))
                  }
                  style={{marginVertical: 0}}
                />
                <Text
                  style={{
                    color: theme.textColorPrimary,
                    paddingHorizontal: 24,
                  }}
                >
                  {`${reader.padding}%`}
                </Text>
                <IconButton
                  icon="plus"
                  color={theme.colorAccent}
                  size={26}
                  disabled={reader.padding >= 10 ? true : false}
                  onPress={() =>
                    dispatch(setReaderSettings('padding', reader.padding + 1))
                  }
                  style={{marginVertical: 0}}
                />
              </Row>
            </Row>
            <Row
              style={{
                justifyContent: 'space-between',
                marginVertical: 6,
              }}
            >
              <Text style={{color: theme.textColorSecondary}}>Line height</Text>
              <Row>
                <IconButton
                  icon="minus"
                  color={theme.colorAccent}
                  size={26}
                  disabled={reader.lineHeight <= 1.3 ? true : false}
                  onPress={() =>
                    dispatch(
                      setReaderSettings('lineHeight', reader.lineHeight - 0.1),
                    )
                  }
                  style={{marginVertical: 0}}
                />
                <Text
                  style={{
                    color: theme.textColorPrimary,
                    paddingHorizontal: 24,
                  }}
                >
                  {`${Math.round(reader.lineHeight * 10) / 10}%`}
                </Text>
                <IconButton
                  icon="plus"
                  color={theme.colorAccent}
                  size={26}
                  disabled={reader.lineHeight >= 2 ? true : false}
                  onPress={() =>
                    dispatch(
                      setReaderSettings('lineHeight', reader.lineHeight + 0.1),
                    )
                  }
                  style={{marginVertical: 0}}
                />
              </Row>
            </Row>
            <ReaderBottomSheetFontPicker reader={reader} theme={theme} />
          </View>
          <ReaderBottomSheetSwitch
            label="Use WebView"
            onPress={() =>
              dispatch(
                setAppSettings('useWebViewForChapter', !useWebViewForChapter),
              )
            }
            value={useWebViewForChapter}
            theme={theme}
          />
          <ReaderBottomSheetSwitch
            label="Fullscreen"
            onPress={() =>
              dispatch(setAppSettings('fullScreenMode', !fullScreenMode))
            }
            value={fullScreenMode}
            theme={theme}
          />
          {!useWebViewForChapter && (
            <ReaderBottomSheetSwitch
              label="AutoScroll"
              onPress={() =>
                dispatch(setAppSettings('autoScroll', !autoScroll))
              }
              value={autoScroll}
              theme={theme}
            />
          )}
          <ReaderBottomSheetSwitch
            label="Show battery and time"
            onPress={() =>
              dispatch(
                setAppSettings('showBatteryAndTime', !showBatteryAndTime),
              )
            }
            value={showBatteryAndTime}
            theme={theme}
          />
          <ReaderBottomSheetSwitch
            label="Show progress percentage"
            onPress={() =>
              dispatch(
                setAppSettings('showScrollPercentage', !showScrollPercentage),
              )
            }
            value={showScrollPercentage}
            theme={theme}
          />
          <ReaderBottomSheetSwitch
            label="Swipe gestures"
            onPress={enableSwipeGestures}
            value={swipeGestures}
            theme={theme}
          />
          {!useWebViewForChapter && (
            <ReaderBottomSheetSwitch
              label="Select text"
              onPress={() =>
                dispatch(setAppSettings('textSelectable', !selectText))
              }
              value={selectText}
              theme={theme}
            />
          )}
        </View>
      </ScrollView>
    </Bottomsheet>
  );
};

export default memo(ReaderSheet);

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  readerSettingsContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 30,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  switchStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
