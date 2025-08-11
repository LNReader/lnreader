import {
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import React from 'react';

import { defaultTo } from 'lodash-es';

import { Button, List } from '@components/index';

import { useChapterGeneralSettings } from '@hooks/persisted';
import { useTheme } from '@providers/Providers';
import { getString } from '@strings/translations';
import SettingSwitch from '../../components/SettingSwitch';

const GeneralSettings: React.FC = () => {
  const theme = useTheme();

  const {
    keepScreenOn = true,
    useVolumeButtons = false,
    verticalSeekbar = true,
    swipeGestures = false,
    pageReader = false,
    autoScroll = false,
    autoScrollInterval = 10,
    autoScrollOffset = null,
    bionicReading = false,
    tapToScroll = false,
    setChapterGeneralSettings,
  } = useChapterGeneralSettings();

  const areAutoScrollSettingsDefault =
    autoScrollInterval === 10 && autoScrollOffset === null;

  const { height: screenHeight } = useWindowDimensions();

  const labelStyle = [styles.fontSizeL, { color: theme.onSurface }];
  return (
    <>
      <List.SubHeader theme={theme}>
        {getString('generalSettings')}
      </List.SubHeader>
      <SettingSwitch
        label={getString('readerScreen.bottomSheet.keepScreenOn')}
        value={keepScreenOn}
        onPress={() =>
          setChapterGeneralSettings({ keepScreenOn: !keepScreenOn })
        }
        theme={theme}
      />
      <SettingSwitch
        label={getString('readerScreen.bottomSheet.verticalSeekbar')}
        description={getString('readerSettings.verticalSeekbarDesc')}
        value={verticalSeekbar}
        onPress={() =>
          setChapterGeneralSettings({ verticalSeekbar: !verticalSeekbar })
        }
        theme={theme}
      />
      <SettingSwitch
        label={getString('readerScreen.bottomSheet.volumeButtonsScroll')}
        value={useVolumeButtons}
        onPress={() =>
          setChapterGeneralSettings({ useVolumeButtons: !useVolumeButtons })
        }
        theme={theme}
      />
      <SettingSwitch
        label={getString('readerScreen.bottomSheet.swipeGestures')}
        value={swipeGestures}
        onPress={() =>
          setChapterGeneralSettings({ swipeGestures: !swipeGestures })
        }
        theme={theme}
      />
      <SettingSwitch
        label={getString('readerScreen.bottomSheet.bionicReading')}
        value={bionicReading}
        onPress={() =>
          setChapterGeneralSettings({ bionicReading: !bionicReading })
        }
        theme={theme}
      />
      <SettingSwitch
        label={getString('readerScreen.bottomSheet.tapToScroll')}
        value={tapToScroll}
        onPress={() => setChapterGeneralSettings({ tapToScroll: !tapToScroll })}
        theme={theme}
      />
      <SettingSwitch
        label={getString('readerScreen.bottomSheet.pageReader')}
        value={pageReader}
        onPress={() => setChapterGeneralSettings({ pageReader: !pageReader })}
        theme={theme}
      />
      <SettingSwitch
        label={getString('readerScreen.bottomSheet.autoscroll')}
        value={autoScroll}
        onPress={() => setChapterGeneralSettings({ autoScroll: !autoScroll })}
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
              {getString('readerSettings.autoScrollInterval')}
            </Text>
            <TextInput
              style={labelStyle}
              defaultValue={defaultTo(autoScrollInterval, 10).toString()}
              keyboardType="numeric"
              onChangeText={text => {
                if (text) {
                  setChapterGeneralSettings({
                    autoScrollInterval: Number(text),
                  });
                }
              }}
            />
          </View>
          <View style={styles.autoScrollInterval}>
            <Text style={[labelStyle, styles.paddingRightM]} numberOfLines={2}>
              {getString('readerSettings.autoScrollOffset')}
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
                  setChapterGeneralSettings({ autoScrollOffset: Number(text) });
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
                  setChapterGeneralSettings({ autoScrollInterval: 10 });
                  setChapterGeneralSettings({ autoScrollOffset: null });
                }}
              />
            </View>
          ) : null}
        </>
      ) : (
        <></>
      )}
    </>
  );
};
export default GeneralSettings;

const styles = StyleSheet.create({
  autoScrollInterval: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  bottomInset: {
    paddingBottom: 40,
  },
  customCSSButtons: {
    flex: 1,
    flexDirection: 'row-reverse',
  },
  customCSSContainer: {
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  customThemeButton: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  flex: {
    flex: 1,
  },
  fontSizeL: {
    fontSize: 16,
  },
  label: {
    fontSize: 16,
  },
  marginLeftS: {
    marginLeft: 8,
  },
  paddingRightM: {
    flex: 1,
    paddingRight: 16,
  },
});
