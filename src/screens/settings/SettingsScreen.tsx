import React from 'react';
import { View } from 'react-native';

import { Appbar, List } from '@components';
import { useTheme } from '@hooks/persisted';

import { getString } from '@strings/translations';
import { SettingsScreenProps } from '@navigators/types';

const SettingsScreen = ({ navigation }: SettingsScreenProps) => {
  const theme = useTheme();

  return (
    <>
      <Appbar
        title={getString('moreScreen.settings')}
        handleGoBack={navigation.goBack}
        theme={theme}
      />
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <List.Item
          title={getString('moreScreen.settingsScreen.generalSettings')}
          icon="tune"
          onPress={() =>
            navigation.navigate('SettingsStack', {
              screen: 'GeneralSettings',
            })
          }
          theme={theme}
        />
        <List.Item
          title={getString('moreScreen.settingsScreen.appearance')}
          icon="palette-outline"
          onPress={() =>
            navigation.navigate('SettingsStack', {
              screen: 'AppearanceSettings',
            })
          }
          theme={theme}
        />
        {/* <List.Item
          title={getString('library')}
          icon="book-variant-multiple"
          onPress={() =>
            navigation.navigate('SettingsStack', {
              screen: 'LibrarySettings',
            })
          }
          theme={theme}
        /> */}
        <List.Item
          title={getString('moreScreen.settingsScreen.readerSettings.title')}
          icon="book-open-outline"
          onPress={() =>
            navigation.navigate('SettingsStack', {
              screen: 'ReaderSettings',
            })
          }
          theme={theme}
        />
        <List.Item
          title={getString('moreScreen.settingsScreen.tracking')}
          icon="sync"
          onPress={() =>
            navigation.navigate('SettingsStack', {
              screen: 'TrackerSettings',
            })
          }
          theme={theme}
        />
        <List.Item
          title={getString('moreScreen.settingsScreen.backup')}
          icon="cloud-upload-outline"
          onPress={() =>
            navigation.navigate('SettingsStack', {
              screen: 'BackupSettings',
            })
          }
          theme={theme}
        />
        <List.Item
          title={getString('moreScreen.settingsScreen.advanced')}
          icon="code-tags"
          onPress={() =>
            navigation.navigate('SettingsStack', {
              screen: 'AdvancedSettings',
            })
          }
          theme={theme}
        />
      </View>
    </>
  );
};

export default SettingsScreen;