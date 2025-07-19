import React, { useState } from 'react';
import { useTheme } from '@hooks/persisted';
import { Appbar, List, SafeAreaView } from '@components';
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
import { StyleSheet, View } from 'react-native';
import { Checkbox } from 'react-native-paper';
import ServiceManager from '@services/ServiceManager';
import { showToast } from '@utils/showToast';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';

const IncludeDownloadsCheckbox = ({
  includeDownloads,
  onToggle,
  theme,
}: {
  includeDownloads: boolean;
  onToggle: () => void;
  theme: any;
}) => (
  <Checkbox.Android
    status={includeDownloads ? 'checked' : 'unchecked'}
    onPress={onToggle}
    uncheckedColor={theme.onSurfaceDisabled}
    color={theme.primary}
  />
);

const BackupSettings = ({ navigation }: BackupSettingsScreenProps) => {
  const theme = useTheme();
  const [includeDownloads, setIncludeDownloads] = useState(false);

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

  const handleCreateBackup = async () => {
    try {
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (!permissions || !permissions.granted) {
        showToast('Storage permission not granted');
        return;
      }

      ServiceManager.manager.addTask({
        name: 'LOCAL_BACKUP',
        data: { includeDownloads, directoryUri: permissions.directoryUri },
      });
      showToast('Backup job added to queue');
    } catch (error: any) {
      showToast(`Failed to select backup location: ${error.message}`);
    }
  };

  const handleRestoreBackup = async () => {
    try {
      const backup = await DocumentPicker.getDocumentAsync({
        type: 'application/zip',
        copyToCacheDirectory: true,
      });

      if (!backup || backup.canceled === true) {
        return;
      }

      if (!backup.assets || backup.assets.length === 0) {
        showToast('No backup file selected');
        return;
      }

      ServiceManager.manager.addTask({
        name: 'LOCAL_RESTORE',
        data: { includeDownloads, backupFile: backup.assets[0] },
      });
      showToast('Restore job added to queue');
    } catch (error: any) {
      showToast(`Failed to select backup file: ${error.message}`);
    }
  };

  const handleToggleIncludeDownloads = () => {
    setIncludeDownloads(!includeDownloads);
  };

  const renderIncludeDownloadsCheckbox = () => (
    <View>
      <IncludeDownloadsCheckbox
        includeDownloads={includeDownloads}
        onToggle={handleToggleIncludeDownloads}
        theme={theme}
      />
    </View>
  );

  return (
    <SafeAreaView excludeTop>
      <Appbar
        title={getString('common.backup')}
        handleGoBack={() => navigation.goBack()}
        theme={theme}
      />
      <ScrollView style={styles.paddingBottom}>
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
            {getString('backupScreen.localBackup')}
          </List.SubHeader>

          <List.Item
            title={getString('backupScreen.includeDownloadedChapters')}
            description={getString(
              'backupScreen.includeDownloadedChaptersDesc',
            )}
            theme={theme}
            onPress={handleToggleIncludeDownloads}
            right={renderIncludeDownloadsCheckbox}
          />

          <List.Item
            title={getString('backupScreen.createBackup')}
            description={getString('backupScreen.createBackupDesc')}
            onPress={handleCreateBackup}
            theme={theme}
          />

          <List.Item
            title={getString('backupScreen.restoreBackup')}
            description={getString('backupScreen.restoreBackupDesc')}
            onPress={handleRestoreBackup}
            theme={theme}
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
            theme={theme}
          />
          <List.InfoItem
            title={getString('backupScreen.createBackupWarning')}
            theme={theme}
          />
        </List.Section>
      </ScrollView>
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
    </SafeAreaView>
  );
};

export default BackupSettings;

const styles = StyleSheet.create({
  paddingBottom: { paddingBottom: 40 },
});
