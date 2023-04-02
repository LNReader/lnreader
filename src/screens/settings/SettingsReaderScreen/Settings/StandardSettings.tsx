import {
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import React, { useState } from 'react';

import { defaultTo } from 'lodash-es';

import {
  Button,
  ColorPreferenceItem,
  List,
  SwitchItem,
} from '@components/index';
import ReaderThemeSelector from '../../../../screens/reader/components/ReaderBottomSheet/ReaderThemeSelector';
import ReaderTextAlignSelector from '../../../../screens/reader/components/ReaderBottomSheet/ReaderTextAlignSelector';
import ReaderLineHeight from '../../../../screens/reader/components/ReaderBottomSheet/ReaderLineHeight';
import ReaderTextSize from '../ReaderTextSize';

import {
  useSettingsV1,
  useAppDispatch,
  useSettingsV2,
  readerSettingType,
} from '@redux/hooks';
import { useTheme } from '@hooks/useTheme';
import { getString } from '@strings/translations';
import {
  setAppSettings,
  setReaderSettings,
} from '@redux/settings/settings.actions';

import useBoolean from '@hooks/useBoolean';
import {
  deleteCustomReaderTheme,
  saveCustomReaderTheme,
} from '@redux/settings/settingsSlice';
import {
  presetReaderThemes,
  readerFonts,
} from '../../../../utils/constants/readerConstants';
import { settingEnum } from '../SettingsReaderScreen';
import { Portal } from 'react-native-paper';
import ColorPickerModal from '@components/ColorPickerModal/ColorPickerModal';
import FontPickerModal from '../FontPickerModal';

export type TextAlignments =
  | 'left'
  | 'center'
  | 'auto'
  | 'right'
  | 'justify'
  | undefined;

interface StandardSettingsProps {
  setSetting: (value: React.SetStateAction<settingEnum>) => void;
  readerSettings: readerSettingType;
}

const StandardSettings: React.FC<StandardSettingsProps> = ({
  setSetting,
  readerSettings,
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const {
    useVolumeButtons = false,
    verticalSeekbar = true,
    swipeGestures = false,
    autoScroll = false,
    autoScrollInterval = 10,
    autoScrollOffset = null,
    fullScreenMode = true,
    showScrollPercentage = true,
    showBatteryAndTime = false,
  } = useSettingsV1();

  const {
    reader: { customThemes = [] },
  } = useSettingsV2();
  const readerBackgroundModal = useBoolean();
  const readerTextColorModal = useBoolean();
  const readerFontPickerModal = useBoolean();

  const isCurrentThemeCustom = customThemes.some(
    item =>
      item.backgroundColor === readerSettings.theme &&
      item.textColor === readerSettings.textColor,
  );

  const isCurrentThemePreset = presetReaderThemes.some(
    item =>
      item.backgroundColor === readerSettings.theme &&
      item.textColor === readerSettings.textColor,
  );

  const currentFontName = readerFonts.find(
    item => item.fontFamily === readerSettings.fontFamily,
  )?.name;

  const areAutoScrollSettingsDefault =
    autoScrollInterval === 10 && autoScrollOffset === null;

  //const [customCSS, setcustomCSS] = useState(readerSettings.customCSS);
  const [customJS, setCustomJS] = useState(readerSettings.customJS);

  const { height: screenHeight } = useWindowDimensions();

  const labelStyle = [styles.fontSizeL, { color: theme.onSurface }];
  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.bottomInset}>
      <List.SubHeader theme={theme}>
        {getString('moreScreen.settingsScreen.generalSettings')}
      </List.SubHeader>
      <SwitchItem
        label={getString('readerScreen.bottomSheet.verticalSeekbar')}
        description={getString(
          'moreScreen.settingsScreen.readerSettings.verticalSeekbarDesc',
        )}
        value={verticalSeekbar}
        onPress={() =>
          dispatch(setAppSettings('verticalSeekbar', !verticalSeekbar))
        }
        theme={theme}
      />
      <SwitchItem
        label={getString('readerScreen.bottomSheet.volumeButtonsScroll')}
        value={useVolumeButtons}
        onPress={() =>
          dispatch(setAppSettings('useVolumeButtons', !useVolumeButtons))
        }
        theme={theme}
      />
      <SwitchItem
        label={getString('readerScreen.bottomSheet.swipeGestures')}
        value={swipeGestures}
        onPress={() =>
          dispatch(setAppSettings('swipeGestures', !swipeGestures))
        }
        theme={theme}
      />
      <SwitchItem
        label={getString('readerScreen.bottomSheet.autoscroll')}
        value={autoScroll}
        onPress={() => dispatch(setAppSettings('autoScroll', !autoScroll))}
        theme={theme}
      />
      {autoScroll ? (
        <>
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>
            {getString('readerScreen.bottomSheet.autoscroll')}
          </List.SubHeader>
          <View style={styles.autoScrollInterval}>
            <Text style={[labelStyle, styles.paddingRightM]} numberOfLines={2}>
              {getString(
                'moreScreen.settingsScreen.readerSettings.autoScrollInterval',
              )}
            </Text>
            <TextInput
              style={labelStyle}
              defaultValue={defaultTo(autoScrollInterval, 10).toString()}
              keyboardType="numeric"
              onChangeText={text => {
                if (text) {
                  dispatch(setAppSettings('autoScrollInterval', Number(text)));
                }
              }}
            />
          </View>
          <View style={styles.autoScrollInterval}>
            <Text style={[labelStyle, styles.paddingRightM]} numberOfLines={2}>
              {getString(
                'moreScreen.settingsScreen.readerSettings.autoScrollOffset',
              )}
            </Text>
            <TextInput
              style={labelStyle}
              defaultValue={defaultTo(
                autoScrollOffset,
                Math.round(screenHeight),
              ).toString()}
              keyboardType="numeric"
              onChangeText={text => {
                if (text) {
                  dispatch(setAppSettings('autoScrollOffset', Number(text)));
                }
              }}
            />
          </View>
          {!areAutoScrollSettingsDefault ? (
            <View style={styles.customCSSButtons}>
              <Button
                style={styles.customThemeButton}
                title={getString('common.reset')}
                onPress={() => {
                  dispatch(setAppSettings('autoScrollInterval', 10));
                  dispatch(setAppSettings('autoScrollOffset', null));
                }}
              />
            </View>
          ) : null}
        </>
      ) : null}
      <>
        <List.Divider theme={theme} />
        {/*
          Custom CSS
      */}
        <List.SubHeader theme={theme}>
          {getString('moreScreen.settingsScreen.readerSettings.customCSS')}
        </List.SubHeader>
        <List.Item
          title="Edit CustomCSS"
          onPress={() => setSetting(settingEnum.CUSTOMCSS)}
          theme={theme}
        />

        <List.Divider theme={theme} />
        {/*
          Custom JS
      */}
        <List.SubHeader theme={theme}>
          {getString('moreScreen.settingsScreen.readerSettings.customJS')}
        </List.SubHeader>
        <View style={styles.customCSSContainer}>
          <TextInput
            style={[{ color: theme.onSurface }, styles.fontSizeL]}
            value={customJS}
            onChangeText={text => setCustomJS(text)}
            placeholderTextColor={theme.onSurfaceVariant}
            placeholder="Example: document.getElementById('example');"
            multiline={true}
          />
          <View style={styles.customCSSButtons}>
            <Button
              onPress={() => dispatch(setReaderSettings('customJS', customJS))}
              style={styles.marginLeftS}
              title={getString('common.save')}
            />
            <Button
              onPress={() => {
                setCustomJS('');
                dispatch(setReaderSettings('customJS', ''));
              }}
              title={getString('common.clear')}
            />
          </View>
        </View>
      </>
      <List.Divider theme={theme} />
      {/*
          Display
      */}
      <List.SubHeader theme={theme}>
        {getString('novelScreen.bottomSheet.display')}
      </List.SubHeader>
      <SwitchItem
        label={getString('readerScreen.bottomSheet.fullscreen')}
        value={fullScreenMode}
        onPress={() =>
          dispatch(setAppSettings('fullScreenMode', !fullScreenMode))
        }
        theme={theme}
      />
      <SwitchItem
        label={getString('readerScreen.bottomSheet.showProgressPercentage')}
        value={showScrollPercentage}
        onPress={() =>
          dispatch(
            setAppSettings('showScrollPercentage', !showScrollPercentage),
          )
        }
        theme={theme}
      />
      <SwitchItem
        label={getString('readerScreen.bottomSheet.showBatteryAndTime')}
        value={showBatteryAndTime}
        onPress={() =>
          dispatch(setAppSettings('showBatteryAndTime', !showBatteryAndTime))
        }
        theme={theme}
      />
      <List.Divider theme={theme} />
      {/*
          Reader Theme
      */}
      <List.SubHeader theme={theme}>
        {getString('moreScreen.settingsScreen.readerSettings.readerTheme')}
      </List.SubHeader>
      <ReaderThemeSelector
        label={getString('moreScreen.settingsScreen.readerSettings.preset')}
        labelStyle={labelStyle}
      />
      <ColorPreferenceItem
        label={getString(
          'moreScreen.settingsScreen.readerSettings.backgroundColor',
        )}
        description={readerSettings.theme}
        onPress={readerBackgroundModal.setTrue}
        theme={theme}
      />
      <ColorPreferenceItem
        label={getString('moreScreen.settingsScreen.readerSettings.textColor')}
        description={readerSettings.textColor}
        onPress={readerTextColorModal.setTrue}
        theme={theme}
      />
      {isCurrentThemeCustom ? (
        <View style={styles.customCSSButtons}>
          <Button
            style={styles.customThemeButton}
            title={getString(
              'moreScreen.settingsScreen.readerSettings.deleteCustomTheme',
            )}
            onPress={() =>
              dispatch(
                deleteCustomReaderTheme({
                  theme: {
                    backgroundColor: readerSettings.theme,
                    textColor: readerSettings.textColor,
                  },
                }),
              )
            }
          />
        </View>
      ) : !isCurrentThemePreset ? (
        <View style={styles.customCSSButtons}>
          <Button
            style={styles.customThemeButton}
            title={getString(
              'moreScreen.settingsScreen.readerSettings.saveCustomTheme',
            )}
            onPress={() =>
              dispatch(
                saveCustomReaderTheme({
                  theme: {
                    backgroundColor: readerSettings.theme,
                    textColor: readerSettings.textColor,
                  },
                }),
              )
            }
          />
        </View>
      ) : null}
      <ReaderTextAlignSelector labelStyle={labelStyle} />
      <ReaderTextSize labelStyle={labelStyle} />
      <ReaderLineHeight labelStyle={labelStyle} />
      <List.Item
        title={getString('readerScreen.bottomSheet.fontStyle')}
        description={currentFontName}
        onPress={readerFontPickerModal.setTrue}
        theme={theme}
      />
      {/*
          Modals
      */}
      <Portal>
        <ColorPickerModal
          title={getString(
            'moreScreen.settingsScreen.readerSettings.backgroundColor',
          )}
          visible={readerBackgroundModal.value}
          color={readerSettings.theme}
          closeModal={readerBackgroundModal.setFalse}
          theme={theme}
          onSubmit={color => dispatch(setReaderSettings('theme', color))}
        />
        <ColorPickerModal
          title={getString(
            'moreScreen.settingsScreen.readerSettings.textColor',
          )}
          visible={readerTextColorModal.value}
          color={readerSettings.textColor}
          closeModal={readerTextColorModal.setFalse}
          theme={theme}
          onSubmit={color => dispatch(setReaderSettings('textColor', color))}
        />
        <FontPickerModal
          currentFont={readerSettings.fontFamily}
          visible={readerFontPickerModal.value}
          onDismiss={readerFontPickerModal.setFalse}
        />
      </Portal>
    </ScrollView>
  );
};
export default StandardSettings;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  bottomInset: {
    paddingBottom: 40,
  },
  fontSizeL: {
    fontSize: 16,
  },
  autoScrollInterval: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customThemeButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  customCSSContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  marginLeftS: {
    marginLeft: 8,
  },
  customCSSButtons: {
    flex: 1,
    flexDirection: 'row-reverse',
  },
  paddingRightM: {
    flex: 1,
    paddingRight: 16,
  },
  label: {
    fontSize: 16,
  },
});
