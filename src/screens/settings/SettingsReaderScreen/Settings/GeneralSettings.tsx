import {
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import React from 'react';

import { defaultTo } from 'lodash-es';

import { Button, List, SwitchItem } from '@components/index';

import { useSettingsV1, useAppDispatch } from '@redux/hooks';
import { useTheme } from '@hooks/useTheme';
import { getString } from '@strings/translations';
import { setAppSettings } from '@redux/settings/settings.actions';

const GeneralSettings: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const {
    useVolumeButtons = false,
    verticalSeekbar = true,
    swipeGestures = false,
    readerPages = false,
    autoScroll = false,
    autoScrollInterval = 10,
    autoScrollOffset = null,
    bionicReading,
  } = useSettingsV1();

  const areAutoScrollSettingsDefault =
    autoScrollInterval === 10 && autoScrollOffset === null;

  const { height: screenHeight } = useWindowDimensions();

  const labelStyle = [styles.fontSizeL, { color: theme.onSurface }];
  return (
    <>
      <List.SubHeader theme={theme}>
        {getString('moreScreen.settingsScreen.generalSettings')}
      </List.SubHeader>
      <SwitchItem
        label={getString('readerScreen.bottomSheet.bionicReading')}
        value={bionicReading}
        onPress={() =>
          dispatch(setAppSettings('bionicReading', !bionicReading))
        }
        theme={theme}
      />
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
        label={getString('readerScreen.bottomSheet.readerPages')}
        value={readerPages}
        onPress={() => dispatch(setAppSettings('readerPages', !readerPages))}
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
    </>
  );
};
export default GeneralSettings;

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
