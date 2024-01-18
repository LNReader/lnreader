import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { Dialog, Portal } from 'react-native-paper';

import { useTheme } from '@hooks/useTheme';
import { showToast } from '../../hooks/showToast';

import { deleteNovelCache } from '../../database/queries/NovelQueries';
import { clearUpdates } from '../../database/queries/UpdateQueries';
import { clearCoverCache } from '../../services/utils/coverCache';
import { getString } from '@strings/translations';
import useBoolean from '@hooks/useBoolean';
import ConfirmationDialog from '@components/ConfirmationDialog/ConfirmationDialog';
import { deleteReadChaptersFromDb } from '../../database/queries/DownloadQueries';
import { openDirectory } from '../../native/epubParser';

import { Appbar, Button, List } from '@components';
import { ScreenContainer } from '@components/Common';
import CookieManager from '@react-native-cookies/cookies';

const AdvancedSettings = ({ navigation }) => {
  const theme = useTheme();
  const clearCookies = () => {
    CookieManager.clearAll();
    showToast('Cookies cleared');
  };

  /**
   * Confirm Clear Database Dialog
   */
  const [clearDatabaseDialog, setClearDatabaseDialog] = useState(false);
  const showClearDatabaseDialog = () => setClearDatabaseDialog(true);
  const hideClearDatabaseDialog = () => setClearDatabaseDialog(false);

  const [clearUpdatesDialog, setClearUpdatesDialog] = useState(false);
  const showClearUpdatesDialog = () => setClearUpdatesDialog(true);
  const hideClearUpdatesDialog = () => setClearUpdatesDialog(false);

  const {
    value: deleteReadChaptersDialog,
    setTrue: showDeleteReadChaptersDialog,
    setFalse: hideDeleteReadChaptersDialog,
  } = useBoolean();

  return (
    <ScreenContainer theme={theme}>
      <Appbar
        title="Advanced"
        handleGoBack={() => navigation.goBack()}
        theme={theme}
      />
      <ScrollView>
        <List.Section>
          <List.SubHeader theme={theme}>Data Management</List.SubHeader>
          <List.Item
            title="Clear database"
            description="Delete history for novels not in your library"
            onPress={showClearDatabaseDialog}
            theme={theme}
          />
          <List.Item
            title="Clear updates tab"
            description="Clears chapter entries in updates tab"
            onPress={showClearUpdatesDialog}
            theme={theme}
          />
          <List.Item
            title="Clean up cached covers"
            description="Delete all covers cached"
            onPress={clearCoverCache}
            theme={theme}
          />
          <List.Item
            title={getString('advancedSettings.deleteReadChapters')}
            onPress={showDeleteReadChaptersDialog}
            theme={theme}
          />
          <List.Item
            title="Clear cookies"
            onPress={clearCookies}
            theme={theme}
          />
          <List.Item
            title="Import Epub"
            onPress={() => openDirectory()}
            theme={theme}
          />
        </List.Section>
        <Portal>
          <ConfirmationDialog
            title={getString('advancedSettings.deleteReadChaptersDialogTitle')}
            visible={deleteReadChaptersDialog}
            onSubmit={deleteReadChaptersFromDb}
            onDismiss={hideDeleteReadChaptersDialog}
            theme={theme}
          />
          <Dialog
            visible={clearDatabaseDialog}
            onDismiss={hideClearDatabaseDialog}
            style={{
              borderRadius: 28,
              backgroundColor: theme.overlay3,
            }}
          >
            <Dialog.Title
              style={{
                letterSpacing: 0,
                fontSize: 16,
                lineHeight: 16 * 1.5,
                color: theme.onSurface,
              }}
            >
              Are you sure? Read chapters and progress of non-library novels
              will be lost.
            </Dialog.Title>
            <Dialog.Actions>
              <Button onPress={hideClearDatabaseDialog}>
                {getString('common.cancel')}
              </Button>
              <Button
                onPress={() => {
                  deleteNovelCache();
                  hideClearDatabaseDialog();
                }}
              >
                {getString('common.ok')}
              </Button>
            </Dialog.Actions>
          </Dialog>
          <Dialog
            visible={clearUpdatesDialog}
            onDismiss={hideClearUpdatesDialog}
            style={{
              borderRadius: 28,
              backgroundColor: theme.overlay3,
            }}
          >
            <Dialog.Title
              style={{
                letterSpacing: 0,
                fontSize: 16,
                lineHeight: 16 * 1.5,
                color: theme.onSurface,
              }}
            >
              Are you sure? Updates tab will be cleared.
            </Dialog.Title>
            <Dialog.Actions>
              <Button onPress={hideClearUpdatesDialog}>Cancel</Button>
              <Button
                onPress={() => {
                  clearUpdates();
                  showToast('Updates cleared.');
                  hideClearUpdatesDialog();
                }}
              >
                Ok
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>
    </ScreenContainer>
  );
};

export default AdvancedSettings;
