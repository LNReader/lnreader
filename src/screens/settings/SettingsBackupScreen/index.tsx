import React from 'react';

import { ScreenContainer } from '@components/Common';

import { useTheme } from '@hooks/useTheme';
import { Appbar, List } from '@components';
import { Portal } from 'react-native-paper';
import useBoolean from '@hooks/useBoolean';
// import { remoteBackup, remoteRestore } from '@services/backup/remote';
import { BackupSettingsScreenProps } from '@navigators/types';
import GoogleDriveModal from './Components/GoogleDriveModal';
import { useMMKVBoolean } from 'react-native-mmkv';

const BackupSettings = ({ navigation }: BackupSettingsScreenProps) => {
  const theme = useTheme();
  const {
    value: googleDriveModalVisible,
    setFalse: closeGoogleDriveModal,
    setTrue: openGoogleDriveModal,
  } = useBoolean();

  const [hasBackgroundTask] = useMMKVBoolean('HAS_BACKGROUND_TASK');

  return (
    <>
      <ScreenContainer theme={theme}>
        <Appbar
          title="Backup"
          handleGoBack={() => navigation.goBack()}
          theme={theme}
        />
        <List.Section>
          <List.SubHeader theme={theme}>Remote Backup</List.SubHeader>
          <List.Item
            title="Self Host"
            description="Backup to your server"
            theme={theme}
            disabled={hasBackgroundTask}
          />

          <List.Item
            title="Googe Drive"
            description="Backup to your Google Drive"
            theme={theme}
            onPress={openGoogleDriveModal}
            disabled={hasBackgroundTask}
          />
        </List.Section>
      </ScreenContainer>
      <Portal>
        <GoogleDriveModal
          visible={googleDriveModalVisible}
          theme={theme}
          closeModal={closeGoogleDriveModal}
        />
      </Portal>
    </>
  );
};

export default BackupSettings;
