import React from 'react';
import { StyleSheet, View, Pressable, Text, ScrollView } from 'react-native';
import { getString } from '@strings/translations';

import { List } from '@components';

import { MoreHeader } from './components/MoreHeader';
import { useDownload, useLibrarySettings, useTheme } from '@hooks/persisted';
import { MoreStackScreenProps } from '@navigators/types';
import Switch from '@components/Switch/Switch';

const MoreScreen = ({ navigation }: MoreStackScreenProps) => {
  const theme = useTheme();
  const { queue } = useDownload();
  const {
    incognitoMode = false,
    downloadedOnlyMode = false,
    setLibrarySettings,
  } = useLibrarySettings();

  const enableDownloadedOnlyMode = () =>
    setLibrarySettings({ downloadedOnlyMode: !downloadedOnlyMode });

  const enableIncognitoMode = () =>
    setLibrarySettings({ incognitoMode: !incognitoMode });

  return (
    <ScrollView>
      <MoreHeader
        title={getString('more')}
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
          title={getString('moreScreen.downloadQueue')}
          description={queue.length > 0 ? queue.length + ' remaining' : ''}
          icon="progress-download"
          onPress={() =>
            navigation.navigate('MoreStack', {
              screen: 'DownloadQueue',
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
