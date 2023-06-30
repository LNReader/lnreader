import React, { useState } from 'react';

import { ScreenContainer } from '../../components/Common';

import {
  createBackup,
  restoreBackup,
  restoreError,
} from '../../services/backup/v1/backup';

import { useTheme } from '@hooks/useTheme';
import { Appbar, List } from '@components';
import { Portal } from 'react-native-paper';
import useBoolean from '@hooks/useBoolean';
import ConnectionModal from './components/ConnectionModal';
import { remoteBackup, remoteRestore } from '@services/backup/remote';

const BackupSettings = ({ navigation }) => {
  const theme = useTheme();
  const [ipv4, setIpv4] = useState('');
  const [port, setPort] = useState('8000');
  const {
    value: backupModalVisible,
    setTrue: showBackupModal,
    setFalse: closeBackupModal,
  } = useBoolean();

  const {
    value: restoreModalVisible,
    setTrue: showRestoreModal,
    setFalse: closeRestoreModal,
  } = useBoolean();

  return (
    <>
      <ScreenContainer theme={theme}>
        <Appbar
          title="Backup"
          handleGoBack={() => navigation.goBack()}
          theme={theme}
        />
        <List.Section>
          <List.SubHeader theme={theme}>Backup</List.SubHeader>
          <List.Item
            title="Remote backup"
            description="Backup data to your pc"
            onPress={showBackupModal}
            theme={theme}
          />
          <List.Item
            title="Remote restore"
            description="Restore data from your pc"
            onPress={showRestoreModal}
            theme={theme}
          />
          <List.Item
            title="Create backup"
            description="Can be used to restore current library"
            onPress={createBackup}
            theme={theme}
          />
          <List.Item
            title="Restore backup"
            description="Restore library from backup file"
            onPress={() => restoreBackup()}
            theme={theme}
          />
          <List.Item
            title="Restore error backup"
            description="If there were errors when restoring backup. Using this to restore the remaining. Save your time."
            onPress={restoreError}
            theme={theme}
          />
          <List.InfoItem
            title="Restoring large backups may freeze the app until restoring is finished"
            icon="information-outline"
            theme={theme}
          />
          <List.InfoItem
            title="Create backup may not work on devices with Android 9 or lower."
            icon="information-outline"
            theme={theme}
          />
        </List.Section>
      </ScreenContainer>
      <Portal>
        <ConnectionModal
          title="Remote Backup"
          ipv4={ipv4}
          port={port}
          visible={backupModalVisible}
          theme={theme}
          closeModal={closeBackupModal}
          handle={remoteBackup}
          setIpv4={setIpv4}
          setPort={setPort}
        />
        <ConnectionModal
          title="Remote Restore"
          ipv4={ipv4}
          port={port}
          visible={restoreModalVisible}
          theme={theme}
          closeModal={closeRestoreModal}
          handle={remoteRestore}
          setIpv4={setIpv4}
          setPort={setPort}
        />
      </Portal>
    </>
  );
};

export default BackupSettings;
