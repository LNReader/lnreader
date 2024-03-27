import React from 'react';
import { ThemeColors } from '@theme/types';
import { StyleSheet, Text, View, Image } from 'react-native';
import { Modal, TextInput, overlay } from 'react-native-paper';
import { GoogleSignin, User } from '@react-native-google-signin/google-signin';
import { useEffect, useState } from 'react';
import { Button, EmptyView } from '@components';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import * as Clipboard from 'expo-clipboard';
import { showToast } from '@utils/showToast';
import { getString } from '@strings/translations';
import { exists, getBackups, makeDir } from '@api/drive';
import { createBackup, driveRestore } from '@services/backup/drive';
import { DriveFile } from '@api/drive/types';
import dayjs from 'dayjs';

enum BackupModal {
  UNAUTHORIZED,
  AUTHORIZED,
  CREATE_BACKUP,
  RESTORE_BACKUP,
}

function Authorized({
  theme,
  setBackupModal,
  setUser,
}: {
  theme: ThemeColors;
  setBackupModal: (backupModal: BackupModal) => void;
  setUser: (user?: User) => void;
}) {
  const signOut = () => {
    GoogleSignin.signOut().then(() => {
      setUser();
      setBackupModal(BackupModal.UNAUTHORIZED);
    });
  };
  return (
    <>
      <Button
        title={getString('common.backup')}
        style={[styles.btnOutline, { borderColor: theme.outline }]}
        onPress={() => setBackupModal(BackupModal.CREATE_BACKUP)}
      />
      <Button
        title={getString('common.restore')}
        style={[styles.btnOutline, { borderColor: theme.outline }]}
        onPress={() => setBackupModal(BackupModal.RESTORE_BACKUP)}
      />
      <Button
        title={getString('common.signOut')}
        style={[styles.btnOutline, { borderColor: theme.outline }]}
        onPress={signOut}
      />
    </>
  );
}

function UnAuthorized({
  theme,
  setBackupModal,
  setUser,
}: {
  theme: ThemeColors;
  setBackupModal: (backupModal: BackupModal) => void;
  setUser: (user?: User) => void;
}) {
  const signIn = () => {
    GoogleSignin.hasPlayServices()
      .then(hasPlayServices => {
        if (hasPlayServices) {
          return GoogleSignin.signIn();
        }
      })
      .then(user => {
        setUser(user);
        setBackupModal(BackupModal.AUTHORIZED);
      });
  };
  return (
    <Button
      title={getString('common.signIn')}
      style={[styles.btnOutline, { borderColor: theme.outline }]}
      onPress={signIn}
    />
  );
}

function CreateBackup({
  theme,
  setBackupModal,
  closeModal,
}: {
  theme: ThemeColors;
  setBackupModal: (backupModal: BackupModal) => void;
  closeModal: () => void;
}) {
  const [backupName, setBackupName] = useState('');
  const [fetching, setFetching] = useState(false);

  const prepare = async () => {
    setFetching(true);
    let rootFolder = await exists('LNReader', true, undefined, true);
    if (!rootFolder) {
      rootFolder = await makeDir('LNReader');
    }
    const backupFolderName = backupName.trim() + '.backup';
    let backupFolder = await exists(backupFolderName, true, rootFolder.id);
    if (!backupFolder) {
      backupFolder = await makeDir(backupFolderName, rootFolder.id);
    }
    setFetching(false);
    return backupFolder;
  };

  return (
    <>
      <TextInput
        value={backupName}
        placeholder={getString('backupScreen.backupName')}
        onChangeText={setBackupName}
        mode="outlined"
        underlineColor={theme.outline}
        theme={{ colors: { ...theme } }}
        placeholderTextColor={theme.onSurfaceDisabled}
        disabled={fetching}
      />
      <View style={styles.footerContainer}>
        <Button
          disabled={backupName.trim().length === 0 || fetching}
          title={getString('common.ok')}
          onPress={() => {
            prepare().then(folder => {
              closeModal();
              return createBackup(folder);
            });
          }}
        />
        <Button
          title={getString('common.cancel')}
          onPress={() => setBackupModal(BackupModal.AUTHORIZED)}
        />
      </View>
    </>
  );
}

function RestoreBackup({
  theme,
  setBackupModal,
  closeModal,
}: {
  theme: ThemeColors;
  setBackupModal: (backupModal: BackupModal) => void;
  closeModal: () => void;
}) {
  const [backupList, setBackupList] = useState<DriveFile[]>([]);
  useEffect(() => {
    exists('LNReader', true, undefined, true).then(rootFolder => {
      if (rootFolder) {
        getBackups(rootFolder.id, true).then(backups => setBackupList(backups));
      }
    });
  }, []);

  return (
    <>
      <FlatList
        contentContainerStyle={styles.backupList}
        data={backupList}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Button
            mode="outlined"
            style={styles.btnOutline}
            onPress={() => {
              closeModal();
              driveRestore(item);
            }}
          >
            <Text style={{ color: theme.primary }}>
              {item.name?.replace(/\.backup$/, ' ')}
            </Text>
            <Text style={{ color: theme.secondary, fontSize: 12 }}>
              {'(' + dayjs(item.createdTime).format('LL') + ')'}
            </Text>
          </Button>
        )}
        ListEmptyComponent={() => (
          <EmptyView
            description={getString('backupScreen.noBackupFound')}
            theme={theme}
          />
        )}
      />
      <View style={styles.footerContainer}>
        <Button
          title={getString('common.cancel')}
          onPress={() => setBackupModal(BackupModal.AUTHORIZED)}
        />
      </View>
    </>
  );
}

interface GoogleDriveModalProps {
  visible: boolean;
  theme: ThemeColors;
  closeModal: () => void;
}

export default function GoogleDriveModal({
  visible,
  theme,
  closeModal,
}: GoogleDriveModalProps) {
  const [backupModal, setBackupModal] = useState(BackupModal.UNAUTHORIZED);
  const [user, setUser] = useState<User | null | undefined>(null);
  useEffect(() => {
    GoogleSignin.configure({
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    GoogleSignin.isSignedIn()
      .then(isSignedIn => {
        if (isSignedIn) {
          return GoogleSignin.getCurrentUser();
        } else {
          setBackupModal(BackupModal.UNAUTHORIZED);
        }
      })
      .then(user => {
        if (user) {
          setUser(user);
          setBackupModal(BackupModal.AUTHORIZED);
        }
      });
  }, []);

  const renderModal = () => {
    switch (backupModal) {
      case BackupModal.AUTHORIZED:
        return (
          <Authorized
            theme={theme}
            setBackupModal={setBackupModal}
            setUser={setUser}
          />
        );
      case BackupModal.UNAUTHORIZED:
        return (
          <UnAuthorized
            theme={theme}
            setBackupModal={setBackupModal}
            setUser={setUser}
          />
        );
      case BackupModal.CREATE_BACKUP:
        return (
          <CreateBackup
            theme={theme}
            setBackupModal={setBackupModal}
            closeModal={closeModal}
          />
        );
      case BackupModal.RESTORE_BACKUP:
        return (
          <RestoreBackup
            theme={theme}
            setBackupModal={setBackupModal}
            closeModal={closeModal}
          />
        );
    }
  };

  return (
    <Modal
      visible={visible}
      onDismiss={closeModal}
      contentContainerStyle={[
        styles.modalContainer,
        { backgroundColor: overlay(2, theme.surface) },
      ]}
    >
      <>
        <View style={styles.titleContainer}>
          <Text style={[styles.modalTitle, { color: theme.onSurface }]}>
            {getString('backupScreen.drive.googleDriveBackup')}
          </Text>
          <TouchableOpacity
            onLongPress={() => {
              if (user?.user.email) {
                Clipboard.setStringAsync(user.user.email).then(success => {
                  if (success) {
                    showToast(
                      getString('common.copiedToClipboard', {
                        name: user.user.email,
                      }),
                    );
                  }
                });
              }
            }}
          >
            {user ? (
              <Image
                source={{ uri: user?.user.photo || '' }}
                style={styles.avatar}
              />
            ) : null}
          </TouchableOpacity>
        </View>
        {renderModal()}
      </>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    margin: 30,
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderRadius: 32,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlignVertical: 'center',
    marginBottom: 16,
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 40,
  },
  modalTitle: {
    fontSize: 24,
  },
  footerContainer: {
    marginTop: 24,
    flexDirection: 'row-reverse',
  },
  btnOutline: {
    marginVertical: 4,
    borderWidth: 1,
  },
  loadingContent: {
    borderRadius: 16,
    width: '100%',
  },
  error: {
    fontSize: 16,
    marginTop: 8,
  },
  backupList: {
    flexGrow: 1,
    paddingBottom: 8,
    paddingHorizontal: 4,
  },
});
