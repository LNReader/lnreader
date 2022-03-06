import React from 'react';
import {
  /* StyleSheet ,*/ View,
  Pressable,
  Text,
  ScrollView,
} from 'react-native';
import { Switch } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { ScreenContainer } from '../../components/Common';
import { List } from '../../components/List';

import { useSettings, useTheme } from '../../hooks/reduxHooks';
import { setAppSettings } from '../../redux/settings/settings.actions';
import { MoreHeader } from './components/MoreHeader';

const MoreScreen = ({ navigation }) => {
  const theme = useTheme();
  const { downloadQueue } = useSelector(state => state.downloadsReducer);
  const { incognitoMode = false, downloadedOnlyMode = false } = useSettings();
  const dispatch = useDispatch();

  const enableIncognitoMode = () => {
    dispatch(setAppSettings('incognitoMode', !incognitoMode));
  };

  const enableDownloadedOnlyMode = () => {
    dispatch(setAppSettings('downloadedOnlyMode', !downloadedOnlyMode));
  };

  return (
    <ScreenContainer theme={theme}>
      <MoreHeader title="More" navigation={navigation} theme={theme} />
      <ScrollView style={{ flex: 1 }}>
        <List.Section>
          <Pressable
            android_ripple={{ color: theme.rippleColor }}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 14,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
            onPress={enableDownloadedOnlyMode}
          >
            <View style={{ flexDirection: 'row' }}>
              <List.Icon theme={theme} icon="cloud-off-outline" />
              <View style={{ marginLeft: 16 }}>
                <Text
                  style={{
                    color: theme.textColorPrimary,
                    fontSize: 16,
                  }}
                >
                  Downloaded only
                </Text>
                <Text style={{ color: theme.textColorSecondary }}>
                  Filters all novels in your library
                </Text>
              </View>
            </View>
            <Switch
              value={downloadedOnlyMode}
              onValueChange={enableDownloadedOnlyMode}
              color={theme.colorAccent}
              style={{ marginRight: 8 }}
            />
          </Pressable>
          <Pressable
            android_ripple={{ color: theme.rippleColor }}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 14,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
            onPress={enableIncognitoMode}
          >
            <View style={{ flexDirection: 'row' }}>
              <List.Icon theme={theme} icon="incognito" />
              <View style={{ marginLeft: 16 }}>
                <Text
                  style={{
                    color: theme.textColorPrimary,
                    fontSize: 16,
                  }}
                >
                  Incognito mode
                </Text>
                <Text style={{ color: theme.textColorSecondary }}>
                  Pauses reading history
                </Text>
              </View>
            </View>
            <Switch
              value={incognitoMode}
              onValueChange={enableIncognitoMode}
              color={theme.colorAccent}
              style={{ marginRight: 8 }}
            />
          </Pressable>
          <List.Divider theme={theme} />
          <List.Item
            title="Download queue"
            description={
              downloadQueue.length > 0 && downloadQueue.length + ' remaining'
            }
            icon="progress-download"
            onPress={() =>
              navigation.navigate('MoreStack', {
                screen: 'DownloadQueue',
              })
            }
            theme={theme}
          />
          <List.Item
            title="Downloads"
            icon="folder-download"
            onPress={() =>
              navigation.navigate('MoreStack', {
                screen: 'Downloads',
              })
            }
            theme={theme}
          />
          <List.Divider theme={theme} />
          <List.Item
            title="Settings"
            icon="cog-outline"
            onPress={() =>
              navigation.navigate('MoreStack', {
                screen: 'SettingsStack',
              })
            }
            theme={theme}
          />
          <List.Item
            title="About"
            icon="information-outline"
            onPress={() =>
              navigation.navigate('MoreStack', {
                screen: 'About',
              })
            }
            theme={theme}
          />
        </List.Section>
      </ScrollView>
    </ScreenContainer>
  );
};

export default MoreScreen;

// const styles = StyleSheet.create({});
