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
import SelfHostModal from './Components/SelfHostModal';
import {
  createBackup as deprecatedCreateBackup,
  restoreBackup as deprecatedRestoreBackup,
  restoreError as deprecatedRestoreError,
} from '@services/backup/legacy';
import { ScrollView } from 'react-native-gesture-handler';

const BackupSettings = ({ navigation }: BackupSettingsScreenProps) => {
  const theme = useTheme();
  const {
    value: googleDriveModalVisible,
    setFalse: closeGoogleDriveModal,
    setTrue: openGoogleDriveModal,
  } = useBoolean();

  const {
    value: selfHostModalVisible,
    setFalse: closeSelfHostModal,
    setTrue: openSelfHostModal,
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
        <ScrollView style={{ paddingBottom: 40 }}>
          <List.Section>
            <List.SubHeader theme={theme}>Remote Backup</List.SubHeader>
            <List.Item
              title="Self Host"
              description="Backup to your server"
              theme={theme}
              onPress={openSelfHostModal}
              disabled={hasBackgroundTask}
            />

            <List.Item
              title="Googe Drive"
              description="Backup to your Google Drive"
              theme={theme}
              onPress={openGoogleDriveModal}
              disabled={hasBackgroundTask}
            />
            <List.SubHeader theme={theme}>Legacy Backup</List.SubHeader>
            <List.Item
              title="Create backup (Deprecated)"
              description="Can be used to restore current library"
              onPress={deprecatedCreateBackup}
              theme={theme}
            />
            <List.Item
              title="Restore backup (Deprecated)"
              description="Restore library from backup file"
              onPress={() => deprecatedRestoreBackup()}
              theme={theme}
            />
            <List.Item
              title="Restore error (Deprecated)"
              description="Using this to restore the remaining. Save your time."
              onPress={deprecatedRestoreError}
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
        </ScrollView>
      </ScreenContainer>
      <Portal>
        <GoogleDriveModal
          visible={googleDriveModalVisible}
          theme={theme}
          closeModal={closeGoogleDriveModal}
        />
        <SelfHostModal
          theme={theme}
          visible={selfHostModalVisible}
          closeModal={closeSelfHostModal}
        />
      </Portal>
    </>
  );
};

export default BackupSettings;
