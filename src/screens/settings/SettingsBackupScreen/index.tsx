import React from 'react';
import { useTheme } from '@hooks/persisted';
import { Appbar, List, SafeAreaView } from '@components';
import { Portal } from 'react-native-paper';
import { useBoolean } from '@hooks';
import { BackupSettingsScreenProps } from '@navigators/types';
import GoogleDriveModal from './Components/GoogleDriveModal';
import SelfHostModal from './Components/SelfHostModal';
import {
  createBackup as deprecatedCreateBackup,
  restoreBackup as deprecatedRestoreBackup,
} from '@services/backup/legacy';
import { ScrollView } from 'react-native-gesture-handler';
import { getString } from '@strings/translations';

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

  return (
    <SafeAreaView excludeTop>
      <Appbar
        title={getString('common.backup')}
        handleGoBack={() => navigation.goBack()}
        theme={theme}
      />
      <ScrollView style={{ paddingBottom: 40 }}>
        <List.Section>
          <List.SubHeader theme={theme}>
            {getString('backupScreen.remoteBackup')}
          </List.SubHeader>
          <List.Item
            title={getString('backupScreen.selfHost')}
            description={getString('backupScreen.selfHostDesc')}
            theme={theme}
            onPress={openSelfHostModal}
          />

          <List.Item
            title={getString('backupScreen.googeDrive')}
            description={getString('backupScreen.googeDriveDesc')}
            theme={theme}
            onPress={openGoogleDriveModal}
          />
          <List.SubHeader theme={theme}>
            {getString('backupScreen.legacyBackup')}
          </List.SubHeader>
          <List.Item
            title={`${getString('backupScreen.createBackup')} (${getString(
              'common.deprecated',
            )})`}
            description={getString('backupScreen.createBackupDesc')}
            onPress={deprecatedCreateBackup}
            theme={theme}
          />
          <List.Item
            title={`${getString('backupScreen.restoreBackup')} (${getString(
              'common.deprecated',
            )})`}
            description={getString('backupScreen.restoreBackupDesc')}
            onPress={() => deprecatedRestoreBackup()}
            theme={theme}
          />
          <List.InfoItem
            title={getString('backupScreen.restoreLargeBackupsWarning')}
            icon="information-outline"
            theme={theme}
          />
          <List.InfoItem
            title={getString('backupScreen.createBackupWarning')}
            icon="information-outline"
            theme={theme}
          />
        </List.Section>
      </ScrollView>
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
    </SafeAreaView>
  );
};

export default BackupSettings;
