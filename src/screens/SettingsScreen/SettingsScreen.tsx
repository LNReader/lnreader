import React from 'react';
import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {Appbar, List} from '../../components';

import {useTheme} from '../../redux/hooks';

const SettingsScreen = () => {
  const theme = useTheme();
  const {goBack, navigate} = useNavigation();

  return (
    <>
      <Appbar title="Settings" handleGoBack={goBack} theme={theme} />

      <List.Item
        title="General"
        icon="tune"
        onPress={() =>
          navigate(
            'SettingsStack' as never,
            {
              screen: 'GeneralSettings',
            } as never,
          )
        }
        theme={theme}
      />
      <List.Item
        title="Reader"
        icon="book-open-outline"
        onPress={() =>
          navigate(
            'SettingsStack' as never,
            {
              screen: 'ReaderSettings',
            } as never,
          )
        }
        theme={theme}
      />
      <List.Item
        title="Tracking"
        icon="sync"
        onPress={() =>
          navigate(
            'SettingsStack' as never,
            {
              screen: 'TrackerSettings',
            } as never,
          )
        }
        theme={theme}
      />
      {/* <List.Item
        title="Backup"
        icon="cloud-upload-outline"
        onPress={() =>
          navigate(
            'SettingsStack' as never,
            {
              screen: 'BackupSettings',
            } as never,
          )
        }
        theme={theme}
      /> */}
      <List.Item
        title="Appearance"
        icon="palette-outline"
        onPress={() =>
          navigate(
            'SettingsStack' as never,
            {
              screen: 'SettingsAppearance',
            } as never,
          )
        }
        theme={theme}
      />
      <List.Item
        title="Advanced"
        icon="code-tags"
        onPress={() =>
          navigate(
            'SettingsStack' as never,
            {
              screen: 'SettingsAdvanced',
            } as never,
          )
        }
        theme={theme}
      />
    </>
  );
};

export default SettingsScreen;
