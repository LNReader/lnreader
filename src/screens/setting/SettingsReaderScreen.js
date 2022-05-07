import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  KeyboardAvoidingView,
  View,
} from 'react-native';
import { IconButton } from 'react-native-paper';
import WebView from 'react-native-webview';
import { useDispatch } from 'react-redux';

import { Appbar } from '../../components/Appbar';
import ColorPickerModal from '../../components/ColorPickerModal';
import { Row } from '../../components/Common';
import {
  ToggleButton,
  ToggleColorButton,
} from '../../components/Common/ToggleButton';
import { List } from '../../components/List';

import { useSettings, useTheme } from '../../hooks/reduxHooks';
import {
  setAppSettings,
  setReaderSettings,
} from '../../redux/settings/settings.actions';
import {
  readerBackground,
  readerLineHeight,
  readerTextColor,
} from '../reader/utils/readerStyles';
import { useModal } from '../../hooks/useModal';
import SwitchSetting from '../../components/Switch/Switch';
import FontPickerModal from './components/FontPickerModal';
import { fonts } from '../../services/utils/constants';
import { useReaderSettings, useSettingsV2 } from '../../redux/hooks';
import { Button } from '@components/index';
import { ButtonVariation } from '@components/Button/Button';
import {
  deleteCustomReaderTheme,
  saveCustomReaderTheme,
} from '../../redux/settings/settingsSlice';

const presetThemes = [
  {
    backgroundColor: '#000000',
    textColor: 'rgba(255,255,255,0.7)',
  },
  { backgroundColor: '#FFFFFF', textColor: '#111111' },
  { backgroundColor: '#F7DFC6', textColor: '#593100' },
  { backgroundColor: '#292832', textColor: '#CCCCCC' },
  { backgroundColor: '#2B2C30', textColor: '#CCCCCC' },
];

const textAlignments = [
  { value: 'left', icon: 'format-align-left' },
  { value: 'center', icon: 'format-align-center' },
  { value: 'justify', icon: 'format-align-justify' },
  { value: 'right', icon: 'format-align-right' },
];

const SettingsReaderScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const reader = useReaderSettings();

  const {
    reader: { customThemes = [] },
  } = useSettingsV2();

  const {
    useWebViewForChapter = false,
    verticalSeekbar = true,
    swipeGestures = true,
    fullScreenMode = true,
    showScrollPercentage = true,
    showBatteryAndTime = false,
    autoScrollInterval = 10,
  } = useSettings();

  const readerFontPickerModal = useModal();
  const readerBackgroundModal = useModal();
  const readerTextColorModal = useModal();

  const setReaderBackground = val => {
    dispatch(setReaderSettings('theme', val));
  };

  const setReaderTextColor = val => {
    dispatch(setReaderSettings('textColor', val ?? reader.textColor));
  };

  const [customCSS, setcustomCSS] = useState(reader.customCSS);

  const readerThemes = [...customThemes, ...presetThemes];

  return (
    <>
      <Appbar title="Reader" onBackAction={navigation.goBack} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {useWebViewForChapter ? (
            <WebView
              originWhitelist={['*']}
              style={{
                height: 500,
                backgroundColor: readerBackground(reader.theme),
              }}
              nestedScrollEnabled={true}
              source={{
                html: `
                <html>
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
                        <style>
                        body {
                            color: ${reader.textColor};
                            text-align: ${reader.textAlign};
                            line-height: ${reader.lineHeight};
                            font-size: ${reader.textSize}px;
                            padding-top: 8px;
                            padding-bottom: 8px;
                            padding-left: ${reader.padding}%;
                            padding-right: ${reader.padding}%;
                            font-family: ${reader.fontFamily}; 
                        }
                        </style>
                        <style>
                          
                            ${reader.customCSS}
                           
                            @font-face {
                                font-family: ${reader.fontFamily};
                                src: url("file:///android_asset/fonts/${reader.fontFamily}.ttf");
                            }
                        </style>
                    </head>
                    <body>
                    <p>  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean lobortis, diam sed malesuada bibendum, nulla libero scelerisque sapien, nec interdum nisl ipsum ac ipsum. In lacinia eros ut quam commodo, in finibus augue ultricies. Vestibulum ex purus, condimentum eget sem at, molestie semper mi. Mauris ac feugiat quam. Pellentesque sagittis bibendum nibh eu lacinia. Aenean rhoncus, velit sit amet mollis egestas, diam turpis ornare velit, a dictum elit velit in erat. Quisque luctus in sem a vulputate.
                    </p>
                    <p>  Pellentesque id tempus orci, non finibus tortor. Suspendisse in neque non eros eleifend hendrerit vitae a lacus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Nunc interdum magna nulla, eget pharetra arcu dapibus eu. Pellentesque sed lectus sit amet sem porta lacinia. Curabitur consectetur dolor in nibh varius, ac placerat erat pellentesque. Proin in justo condimentum, fermentum lacus eget, ultrices ante. Fusce tempor blandit erat nec mollis. Vivamus in leo et nunc consectetur elementum nec ac lectus.
                    </p>  
                    <p>  In consectetur libero tempor metus interdum, sit amet viverra leo dapibus. Nullam tincidunt justo hendrerit lorem maximus, eu pretium erat fringilla. Nulla scelerisque leo at enim convallis, a elementum velit laoreet. Aliquam quis vestibulum quam. Morbi ut sollicitudin mi, et laoreet elit. Vivamus mattis, nulla at blandit sodales, lectus lacus luctus metus, non euismod neque urna vel nisl. Quisque vitae ante vitae orci tempus egestas quis eu nibh. Phasellus eget nulla non velit tincidunt fringilla eget nec libero. Morbi tempor erat quis rutrum condimentum.
                    </p>  
                    <p>  Cras sem magna, tempus sed urna eget, scelerisque tincidunt tortor. Cras euismod turpis libero, ut condimentum nulla ultrices id. Phasellus faucibus, elit ut imperdiet euismod, enim dui volutpat turpis, in tincidunt ex ligula non felis. Praesent erat erat, ultrices ut imperdiet sed, congue eu leo. Aliquam viverra fringilla ultrices. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Praesent ac malesuada massa. Cras eu augue in dui venenatis laoreet sit amet eget sem. Nullam malesuada sapien felis, et varius neque auctor eu.
                    </p>  
                    <p>  Sed vestibulum facilisis libero, in aliquet mauris lobortis et. In vitae lectus id risus cursus dictum at ac mi. Praesent ac lectus eget nunc elementum pellentesque. Ut at dui magna. Aliquam mattis posuere gravida. Morbi volutpat, dolor quis varius tincidunt, quam nulla vulputate libero, eu sagittis dui odio et magna. Sed luctus lectus ante, sit amet ultrices ligula convallis vitae. Sed efficitur libero nec quam porta, et fringilla turpis egestas. Nulla facilisi. Duis leo tellus, porta non enim eu, tincidunt cursus lorem.
                    </p>
                    </body>
                </html>
                `,
              }}
            />
          ) : (
            <View
              style={{
                backgroundColor: readerBackground(reader.theme),
                padding: `${reader.padding}%`,
                height: 500,
              }}
            >
              <Text
                style={{
                  color: reader.textColor,
                  fontSize: reader.textSize,
                  lineHeight: readerLineHeight(
                    reader.textSize,
                    reader.lineHeight,
                  ),
                  fontFamily: reader.fontFamily,
                }}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean
                lobortis, diam sed malesuada bibendum, nulla libero scelerisque
                sapien, nec interdum nisl ipsum ac ipsum. In lacinia eros ut
                quam commodo, in finibus augue ultricies. Vestibulum ex purus,
                condimentum eget sem at, molestie semper mi. Mauris ac feugiat
                quam. Pellentesque sagittis bibendum nibh eu lacinia. Aenean
                rhoncus, velit sit amet mollis egestas, diam turpis ornare
                velit, a dictum elit velit in erat. Quisque luctus in sem a
                vulputate.{'\n\n'}Pellentesque id tempus orci, non finibus
                tortor. Suspendisse in neque non eros eleifend hendrerit vitae a
                lacus. Vestibulum ante ipsum primis in faucibus orci luctus et
                ultrices posuere cubilia curae; Nunc interdum magna nulla, eget
                pharetra arcu dapibus eu. Pellentesque sed lectus sit amet sem
                porta lacinia. Curabitur consectetur dolor in nibh varius, ac
                placerat erat pellentesque. Proin in justo condimentum,
                fermentum lacus eget, ultrices ante. Fusce tempor blandit erat
                nec mollis. Vivamus in leo et nunc consectetur elementum nec ac
                lectus.
              </Text>
            </View>
          )}
          <SwitchSetting
            label="Render HTML"
            description="Render chapter as html"
            value={useWebViewForChapter}
            onPress={() =>
              dispatch(
                setAppSettings('useWebViewForChapter', !useWebViewForChapter),
              )
            }
            theme={theme}
          />
          <SwitchSetting
            label="Horizontal seekbar"
            description="Show horizontal seekbar instead of vertical"
            value={verticalSeekbar}
            onPress={() =>
              dispatch(setAppSettings('verticalSeekbar', !verticalSeekbar))
            }
            theme={theme}
          />
          <SwitchSetting
            label="Gesture navigation"
            description="Use left and right swipe to navigate to previous or next chapter"
            value={swipeGestures}
            onPress={() =>
              dispatch(setAppSettings('swipeGestures', !swipeGestures))
            }
            theme={theme}
          />
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>
            Auto scroll interval (in seconds)
          </List.SubHeader>
          <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
            <TextInput
              style={{
                color: theme.textColorPrimary,
                fontSize: 16,
              }}
              defaultValue={autoScrollInterval.toString() ?? 10}
              keyboardType="numeric"
              onChangeText={text =>
                text !== '' &&
                dispatch(
                  setAppSettings('autoScrollInterval', parseInt(text, 10)),
                )
              }
            />
          </View>
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>Display</List.SubHeader>
          <SwitchSetting
            label="Fullscreen"
            value={fullScreenMode}
            onPress={() =>
              dispatch(setAppSettings('fullScreenMode', !fullScreenMode))
            }
            theme={theme}
          />
          <SwitchSetting
            label="Show progress percentage"
            value={showScrollPercentage}
            onPress={() =>
              dispatch(
                setAppSettings('showScrollPercentage', !showScrollPercentage),
              )
            }
            theme={theme}
          />

          <SwitchSetting
            label="Show battery and time"
            value={showBatteryAndTime}
            onPress={() =>
              dispatch(
                setAppSettings('showBatteryAndTime', !showBatteryAndTime),
              )
            }
            theme={theme}
          />
          <List.Divider theme={theme} />

          <List.SubHeader theme={theme}>Reader</List.SubHeader>
          <View style={styles.pressableListItem}>
            <Text
              style={{
                color: theme.textColorPrimary,
                fontSize: 16,
              }}
            >
              Themes
            </Text>
            <ScrollView
              contentContainerStyle={{
                flexDirection: 'column-reverse',
                alignItems: 'flex-end',
              }}
              style={{ marginLeft: 16 }}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
            >
              <Row>
                {readerThemes.map((item, index) => (
                  <ToggleColorButton
                    key={index}
                    selected={
                      reader.theme === item.backgroundColor &&
                      reader.textColor === item.textColor
                    }
                    backgroundColor={item.backgroundColor}
                    textColor={item.textColor}
                    onPress={() => {
                      dispatch(
                        setReaderSettings('theme', item.backgroundColor),
                      );
                      dispatch(setReaderSettings('textColor', item.textColor));
                    }}
                  />
                ))}
              </Row>
            </ScrollView>
          </View>
          <List.ColorItem
            title="Background Color"
            description={readerBackground(reader.theme).toUpperCase()}
            onPress={readerBackgroundModal.showModal}
            theme={theme}
          />
          <List.ColorItem
            title="Text Color"
            description={
              reader.textColor.toUpperCase() || readerTextColor(reader.theme)
            }
            onPress={readerTextColorModal.showModal}
            theme={theme}
          />
          {!readerThemes.some(
            item =>
              item.backgroundColor === reader.theme &&
              item.textColor === reader.textColor,
          ) ? (
            <Button
              style={{ margin: 16 }}
              va
              theme={theme}
              title="Save Custom Theme"
              variation={ButtonVariation.CLEAR}
              onPress={() =>
                dispatch(
                  saveCustomReaderTheme({
                    theme: {
                      backgroundColor: reader.theme,
                      textColor: reader.textColor,
                    },
                  }),
                )
              }
            />
          ) : null}
          {customThemes.some(
            item =>
              item.backgroundColor === reader.theme &&
              item.textColor === reader.textColor,
          ) ? (
            <Button
              style={{ margin: 16 }}
              va
              theme={theme}
              title="Delete Custom Theme"
              variation={ButtonVariation.CLEAR}
              onPress={() =>
                dispatch(
                  deleteCustomReaderTheme({
                    theme: {
                      backgroundColor: reader.theme,
                      textColor: reader.textColor,
                    },
                  }),
                )
              }
            />
          ) : null}
          <Pressable style={styles.pressableListItem}>
            <View>
              <Text style={{ color: theme.textColorPrimary, fontSize: 16 }}>
                Text Align
              </Text>
              <Text
                style={{
                  color: theme.textColorSecondary,
                  textTransform: 'capitalize',
                }}
              >
                {reader.textAlign}
              </Text>
            </View>
            <Row>
              {textAlignments.map(item => (
                <ToggleButton
                  key={item.value}
                  icon={item.icon}
                  onPress={() => {
                    dispatch(setReaderSettings('textAlign', item.value));
                  }}
                  selected={item.value === reader.textAlign}
                  theme={theme}
                />
              ))}
            </Row>
          </Pressable>
          <List.Item
            title="Font"
            description={
              fonts.find(item => item.fontFamily === reader.fontFamily)?.name
            }
            onPress={readerFontPickerModal.showModal}
            theme={theme}
          />
          <Row
            style={{
              justifyContent: 'space-between',
              marginHorizontal: 16,
              marginVertical: 8,
            }}
          >
            <Text style={{ color: theme.textColorPrimary, fontSize: 16 }}>
              Font size
            </Text>
            <Row>
              <IconButton
                icon="minus"
                color={theme.colorAccent}
                size={26}
                disabled={reader.textSize <= 1 ? true : false}
                onPress={() =>
                  dispatch(setReaderSettings('textSize', reader.textSize - 1))
                }
                style={{ marginVertical: 0 }}
              />
              <Text
                style={{
                  color: theme.textColorPrimary,
                  paddingHorizontal: 24,
                }}
              >
                {reader.textSize}
              </Text>
              <IconButton
                icon="plus"
                color={theme.colorAccent}
                size={26}
                onPress={() =>
                  dispatch(setReaderSettings('textSize', reader.textSize + 1))
                }
                style={{ marginVertical: 0 }}
              />
            </Row>
          </Row>
          <Row
            style={{
              justifyContent: 'space-between',
              marginHorizontal: 16,
              marginVertical: 8,
            }}
          >
            <Text style={{ color: theme.textColorPrimary, fontSize: 16 }}>
              Padding
            </Text>
            <Row>
              <IconButton
                icon="minus"
                color={theme.colorAccent}
                size={26}
                disabled={reader.padding <= 0 ? true : false}
                onPress={() =>
                  dispatch(setReaderSettings('padding', reader.padding - 1))
                }
                style={{ marginVertical: 0 }}
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
                style={{ marginVertical: 0 }}
              />
            </Row>
          </Row>
          <Row
            style={{
              justifyContent: 'space-between',
              marginHorizontal: 16,
              marginVertical: 8,
            }}
          >
            <Text style={{ color: theme.textColorPrimary, fontSize: 16 }}>
              Line height
            </Text>
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
                style={{ marginVertical: 0 }}
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
                style={{ marginVertical: 0 }}
              />
            </Row>
          </Row>
          {useWebViewForChapter ? (
            <>
              <List.Divider theme={theme} />
              <List.SubHeader theme={theme}>Custom CSS</List.SubHeader>
              <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
                <TextInput
                  style={{ color: theme.textColorPrimary, fontSize: 16 }}
                  value={customCSS}
                  onChangeText={text => setcustomCSS(text)}
                  placeholderTextColor={theme.textColorSecondary}
                  placeholder="Example: body { color: red; }"
                  multiline={true}
                />
                <View style={{ flexDirection: 'row-reverse' }}>
                  <Button
                    theme={theme}
                    onPress={() =>
                      dispatch(setReaderSettings('customCSS', customCSS))
                    }
                    style={{ marginLeft: 8 }}
                    title="Save"
                    variation={ButtonVariation.CLEAR}
                  />
                  <Button
                    theme={theme}
                    onPress={() => {
                      setcustomCSS('');
                      dispatch(setReaderSettings('customCSS', ''));
                    }}
                    title="Clear"
                    variation={ButtonVariation.CLEAR}
                  />
                </View>
              </View>
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <ColorPickerModal
        title="Reader background color"
        modalVisible={readerBackgroundModal.visible}
        color={readerBackground(reader.theme)}
        hideModal={readerBackgroundModal.hideModal}
        theme={theme}
        onSubmit={setReaderBackground}
      />
      <ColorPickerModal
        title="Reader text color"
        modalVisible={readerTextColorModal.visible}
        color={reader.textColor}
        hideModal={readerTextColorModal.hideModal}
        theme={theme}
        onSubmit={setReaderTextColor}
      />
      <FontPickerModal
        currentFont={reader.fontFamily}
        visible={readerFontPickerModal.visible}
        hideModal={readerFontPickerModal.hideModal}
        theme={theme}
        dispatch={dispatch}
      />
    </>
  );
};

export default SettingsReaderScreen;

const styles = StyleSheet.create({
  pressableListItem: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fontContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 6,
  },
  fontContent: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
