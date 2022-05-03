import React from 'react';

import { Appbar } from '../../components/Appbar';
import { List } from '../../components/List';
import { ScreenContainer } from '../../components/Common';

import { createBackup, restoreBackup } from '../../services/backup/v1/backup';

import { useTheme } from '../../hooks/reduxHooks';

const BackupSettings = ({ navigation }) => {
  const theme = useTheme();

  return (
    <>
      <ScreenContainer theme={theme}>
        <Appbar title="Backup" onBackAction={() => navigation.goBack()} />
        <List.Section>
          <List.SubHeader theme={theme}>Backup</List.SubHeader>
          <List.Item
            title="Create backup"
            description="Can be used to restore current library"
            onPress={createBackup}
            theme={theme}
          />
          <List.Item
            title="Restore backup"
            description="Restore library from backup file"
            onPress={restoreBackup}
            theme={theme}
          />
          <List.InfoItem
            title="Restoring large backups may freeze the app until restoring is finished"
            icon="information-outline"
            description="Restore library from backup file"
            theme={theme}
          />
          <List.InfoItem
            title="Create backup may not work on devices with Android 9 or lower."
            icon="information-outline"
            description="Restore library from backup file"
            theme={theme}
          />
        </List.Section>
      </ScreenContainer>
    </>
  );
};

export default BackupSettings;
