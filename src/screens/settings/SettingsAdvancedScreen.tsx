import React, { useState } from 'react';

import {
  Dialog,
  Modal,
  Portal,
  Text,
  TextInput,
  overlay,
} from 'react-native-paper';

import { useTheme, useUserAgent } from '@hooks/persisted';
import { showToast } from '@utils/showToast';

import { deleteCachedNovels } from '@hooks/persisted/useNovel';
import { getString } from '@strings/translations';
import { useBoolean } from '@hooks';
import ConfirmationDialog from '@components/ConfirmationDialog/ConfirmationDialog';
import {
  deleteReadChaptersFromDb,
  clearUpdates,
} from '@database/queries/ChapterQueries';

import { Appbar, Button, List } from '@components';
import { importEpub } from '@services/epub/import';
import { AdvancedSettingsScreenProps } from '@navigators/types';
import { useMMKVString } from 'react-native-mmkv';
import { BACKGROUND_ACTION } from '@services/constants';
import { StyleSheet, View } from 'react-native';
import { getUserAgentSync } from 'react-native-device-info';

const AdvancedSettings = ({ navigation }: AdvancedSettingsScreenProps) => {
  const theme = useTheme();
  const { userAgent, setUserAgent } = useUserAgent();
  const [userAgentInput, setUserAgentInput] = useState(userAgent);
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

  const {
    value: userAgentModalVisible,
    setTrue: showUserAgentModal,
    setFalse: hideUserAgentModal,
  } = useBoolean();

  const [hasAction] = useMMKVString(BACKGROUND_ACTION);

  return (
    <>
      <Appbar
        title={getString('moreScreen.settingsScreen.advanced')}
        handleGoBack={() => navigation.goBack()}
        theme={theme}
      />
      <List.Section>
        <List.SubHeader theme={theme}>
          {getString('advancedSettings.dataManagement')}
        </List.SubHeader>
        <List.Item
          title={getString('advancedSettings.clearCachedNovels')}
          description={getString('advancedSettings.clearCachedNovelsDesc')}
          onPress={showClearDatabaseDialog}
          theme={theme}
        />
        <List.Item
          title={getString('advancedSettings.clearUpdatesTab')}
          description={getString('advancedSettings.clearupdatesTabDesc')}
          onPress={showClearUpdatesDialog}
          theme={theme}
        />
        <List.Item
          title={getString('advancedSettings.deleteReadChapters')}
          onPress={showDeleteReadChaptersDialog}
          theme={theme}
        />
        <List.Item
          title={getString('advancedSettings.importEpub')}
          onPress={importEpub}
          theme={theme}
          disabled={Boolean(hasAction)}
        />
        <List.Item
          title={getString('advancedSettings.userAgent')}
          description={userAgent}
          onPress={showUserAgentModal}
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
            {getString('advancedSettings.clearDatabaseWarning')}
          </Dialog.Title>
          <Dialog.Actions>
            <Button onPress={hideClearDatabaseDialog}>
              {getString('common.cancel')}
            </Button>
            <Button
              onPress={() => {
                deleteCachedNovels();
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
            {getString('advancedSettings.clearUpdatesWarning')}
          </Dialog.Title>
          <Dialog.Actions>
            <Button onPress={hideClearUpdatesDialog}>
              {getString('common.cancel')}
            </Button>
            <Button
              onPress={() => {
                clearUpdates();
                showToast(getString('advancedSettings.clearUpdatesMessage'));
                hideClearUpdatesDialog();
              }}
            >
              {getString('common.ok')}
            </Button>
          </Dialog.Actions>
        </Dialog>
        <Modal
          visible={userAgentModalVisible}
          onDismiss={hideUserAgentModal}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: overlay(2, theme.surface) },
          ]}
        >
          <Text style={[styles.modalTitle, { color: theme.onSurface }]}>
            {getString('advancedSettings.userAgent')}
          </Text>
          <Text style={[{ color: theme.onSurfaceVariant }]}>{userAgent}</Text>
          <TextInput
            multiline
            mode="outlined"
            defaultValue={userAgent}
            onChangeText={text => setUserAgentInput(text.trim())}
            placeholderTextColor={theme.onSurfaceDisabled}
            underlineColor={theme.outline}
            style={[{ color: theme.onSurface }, styles.textInput]}
            theme={{ colors: { ...theme } }}
          />
          <View style={styles.buttonGroup}>
            <Button
              onPress={() => {
                setUserAgent(userAgentInput);
                hideUserAgentModal();
              }}
              style={styles.button}
              title={getString('common.save')}
              mode="contained"
            />
            <Button
              style={styles.button}
              onPress={() => {
                setUserAgent(getUserAgentSync());
                hideUserAgentModal();
              }}
              title={getString('common.reset')}
            />
          </View>
        </Modal>
      </Portal>
    </>
  );
};

export default AdvancedSettings;

const styles = StyleSheet.create({
  modalContainer: {
    margin: 30,
    padding: 24,
    borderRadius: 28,
  },
  textInput: {
    height: 120,
    borderRadius: 14,
    marginTop: 16,
    marginBottom: 8,
    fontSize: 12,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
  buttonGroup: {
    flexDirection: 'row-reverse',
  },
  button: {
    marginTop: 16,
    flex: 1,
    marginHorizontal: 8,
  },
});