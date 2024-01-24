import React from 'react';

import { ScreenContainer } from '@components/Common';

import { useTheme } from '@hooks/persisted';
import { Appbar, List } from '@components';
import { Portal } from 'react-native-paper';
import { useBoolean } from '@hooks';
import { BackupSettingsScreenProps } from '@navigators/types';
import GoogleDriveModal from './Components/GoogleDriveModal';
import { useMMKVString } from 'react-native-mmkv';
import SelfHostModal from './Components/SelfHostModal';
import {
  createBackup as deprecatedCreateBackup,
  restoreBackup as deprecatedRestoreBackup,
  restoreError as deprecatedRestoreError,
} from '@services/backup/legacy';
import { ScrollView } from 'react-native-gesture-handler';
import { BACKGROUND_ACTION } from '@services/constants';
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

  const [hasAction] = useMMKVString(BACKGROUND_ACTION);

  return (
    <>
      <ScreenContainer theme={theme}>
        <Appbar
          title={getString('moreScreen.settingsScreen.backup')}
          handleGoBack={() => navigation.goBack()}
          theme={theme}
        />
        <ScrollView style={{ paddingBottom: 40 }}>
          <List.Section>
            <List.SubHeader theme={theme}>
              {getString('moreScreen.settingsScreen.backupScreen.remoteBackup')}
            </List.SubHeader>
            <List.Item
              title={getString(
                'moreScreen.settingsScreen.backupScreen.selfHost',
              )}
              description={getString(
                'moreScreen.settingsScreen.backupScreen.selfHostDesc',
              )}
              theme={theme}
              onPress={openSelfHostModal}
              disabled={Boolean(hasAction)}
            />

            <List.Item
              title={getString(
                'moreScreen.settingsScreen.backupScreen.googeDrive',
              )}
              description={getString(
                'moreScreen.settingsScreen.backupScreen.googeDriveDesc',
              )}
              theme={theme}
              onPress={openGoogleDriveModal}
              disabled={Boolean(hasAction)}
            />
            <List.SubHeader theme={theme}>
              {getString('moreScreen.settingsScreen.backupScreen.legacyBackup')}
            </List.SubHeader>
            <List.Item
              title={getString(
                'moreScreen.settingsScreen.backupScreen.createBackupDeprecated',
              )}
              description={getString(
                'moreScreen.settingsScreen.backupScreen.createBackupDeprecatedDesc',
              )}
              onPress={deprecatedCreateBackup}
              theme={theme}
              disabled={Boolean(hasAction)}
            />
            <List.Item
              title={getString(
                'moreScreen.settingsScreen.backupScreen.restoreBackupDeprecated',
              )}
              description={getString(
                'moreScreen.settingsScreen.backupScreen.restoreBackupDeprecatedDesc',
              )}
              onPress={() => deprecatedRestoreBackup()}
              theme={theme}
              disabled={Boolean(hasAction)}
            />
            <List.Item
              title={getString(
                'moreScreen.settingsScreen.backupScreen.restoreErrorDeprecated',
              )}
              description={getString(
                'moreScreen.settingsScreen.backupScreen.restoreErrorDeprecatedDesc',
              )}
              onPress={deprecatedRestoreError}
              theme={theme}
              disabled={Boolean(hasAction)}
            />
            <List.InfoItem
              title={getString(
                'moreScreen.settingsScreen.backupScreen.restoreLargeBackupsWarning',
              )}
              icon="information-outline"
              theme={theme}
            />
            <List.InfoItem
              title={getString(
                'moreScreen.settingsScreen.backupScreen.createBackupWarning',
              )}
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
