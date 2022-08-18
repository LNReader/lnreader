import React from 'react';
import { View } from 'react-native';
import { getString } from '../../../strings/translations';

import { List } from '../../components/List';

import { useTheme } from '@hooks/useTheme';
import { Appbar } from '@components';

const SettingsScreen = ({ navigation }) => {
  const theme = useTheme();

  return (
    <>
      <Appbar title="Settings" handleGoBack={navigation.goBack} theme={theme} />
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
          title="Tracking"
          icon="sync"
          onPress={() =>
            navigation.navigate('SettingsStack', {
              screen: 'TrackerSettings',
            })
          }
          theme={theme}
        />
        <List.Item
          title="Backup"
          icon="cloud-upload-outline"
          onPress={() =>
            navigation.navigate('SettingsStack', {
              screen: 'BackupSettings',
            })
          }
          theme={theme}
        />
        <List.Item
          title="Appearance"
          icon="palette-outline"
          onPress={() =>
            navigation.navigate('SettingsStack', {
              screen: 'AppearanceSettings',
            })
          }
          theme={theme}
        />
        <List.Item
          title="Advanced"
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
