import React, { useEffect } from 'react';
import { StyleSheet, View, Pressable, Text, ScrollView } from 'react-native';
import { getString } from '@strings/translations';

import { List } from '@components';

import { MoreHeader } from './components/MoreHeader';
import { useLibrarySettings, useTheme } from '@hooks/persisted';
import { MoreStackScreenProps } from '@navigators/types';
import Switch from '@components/Switch/Switch';
import { useMMKVObject } from 'react-native-mmkv';
import ServiceManager, { BackgroundTask } from '@services/ServiceManager';

const MoreScreen = ({ navigation }: MoreStackScreenProps) => {
  const theme = useTheme();
  const [taskQueue] = useMMKVObject<BackgroundTask[]>(
    ServiceManager.manager.STORE_KEY,
  );
  const {
    incognitoMode = false,
    downloadedOnlyMode = false,
    setLibrarySettings,
  } = useLibrarySettings();

  const enableDownloadedOnlyMode = () =>
    setLibrarySettings({ downloadedOnlyMode: !downloadedOnlyMode });

  const enableIncognitoMode = () =>
    setLibrarySettings({ incognitoMode: !incognitoMode });

  useEffect(
    () =>
      navigation.addListener('tabPress', e => {
        if (navigation.isFocused()) {
          e.preventDefault();

          navigation.navigate('MoreStack', {
            screen: 'SettingsStack',
            params: {
              screen: 'Settings',
            },
          });
        }
      }),
    [navigation],
  );

  return (
    <ScrollView>
      <MoreHeader
        // status bar is translucent, text could be mess with it
        title={''}
        navigation={navigation}
        theme={theme}
      />
      <List.Section>
        <Pressable
          android_ripple={{ color: theme.rippleColor }}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 14,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          onPress={enableDownloadedOnlyMode}
        >
          <View style={{ flexDirection: 'row' }}>
            <List.Icon theme={theme} icon="cloud-off-outline" />
            <View style={{ marginLeft: 16 }}>
              <Text
                style={{
                  color: theme.onSurface,
                  fontSize: 16,
                }}
              >
                {getString('moreScreen.downloadOnly')}
              </Text>
              <Text
                style={[styles.description, { color: theme.onSurfaceVariant }]}
              >
                {getString('moreScreen.downloadOnlyDesc')}
              </Text>
            </View>
          </View>
          <Switch
            theme={theme}
            value={downloadedOnlyMode}
            onValueChange={enableDownloadedOnlyMode}
            size={24}
          />
        </Pressable>
        <Pressable
          android_ripple={{ color: theme.rippleColor }}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 14,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          onPress={enableIncognitoMode}
        >
          <View style={{ flexDirection: 'row' }}>
            <List.Icon theme={theme} icon="glasses" />
            <View style={{ marginLeft: 16 }}>
              <Text
                style={{
                  color: theme.onSurface,
                  fontSize: 16,
                }}
              >
                {getString('moreScreen.incognitoMode')}
              </Text>
              <Text
                style={[styles.description, { color: theme.onSurfaceVariant }]}
              >
                {getString('moreScreen.incognitoModeDesc')}
              </Text>
            </View>
          </View>
          <Switch
            theme={theme}
            value={incognitoMode}
            onValueChange={enableIncognitoMode}
            size={24}
          />
        </Pressable>
        <List.Divider theme={theme} />
        <List.Item
          title={'Task Queue'}
          description={
            taskQueue && taskQueue.length > 0
              ? taskQueue.length + ' remaining'
              : ''
          }
          icon="progress-download"
          onPress={() =>
            navigation.navigate('MoreStack', {
              screen: 'TaskQueue',
            })
          }
          theme={theme}
        />
        <List.Item
          title={getString('common.downloads')}
          icon="folder-download"
          onPress={() =>
            navigation.navigate('MoreStack', {
              screen: 'Downloads',
            })
          }
          theme={theme}
        />
        <List.Item
          title={getString('common.categories')}
          icon="label-outline"
          onPress={() =>
            navigation.navigate('MoreStack', {
              screen: 'Categories',
            })
          }
          theme={theme}
        />
        <List.Item
          title={getString('statsScreen.title')}
          icon="chart-line"
          onPress={() =>
            navigation.navigate('MoreStack', {
              screen: 'Statistics',
            })
          }
          theme={theme}
        />
        <List.Divider theme={theme} />
        <List.Item
          title={getString('common.settings')}
          icon="cog-outline"
          onPress={() =>
            navigation.navigate('MoreStack', {
              screen: 'SettingsStack',
              params: {
                screen: 'Settings',
              },
            })
          }
          theme={theme}
        />
        <List.Item
          title={getString('common.about')}
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
  );
};

export default MoreScreen;

const styles = StyleSheet.create({
  description: {
    fontSize: 12,
    lineHeight: 20,
  },
});
