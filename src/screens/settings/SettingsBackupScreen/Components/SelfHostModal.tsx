import { list } from '@api/remote';
import { Button, EmptyView } from '@components';
import { useSelfHost } from '@hooks/persisted/useSelfHost';
import { createBackup, remoteRestore } from '@services/backup/remote';
import { getString } from '@strings/translations';
import { ThemeColors } from '@theme/types';
import { fetchTimeout } from '@utils/fetch/fetch';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { Modal, TextInput, overlay } from 'react-native-paper';

enum BackupModal {
  SET_HOST,
  CONNECTED,
  CREATE_BACKUP,
  RESTORE_BACKUP,
}

interface SelfHostModalProps {
  visible: boolean;
  theme: ThemeColors;
  closeModal: () => void;
}

function CreateBackup({
  host,
  theme,
  setBackupModal,
  closeModal,
}: {
  host: string;
  theme: ThemeColors;
  setBackupModal: (backupModal: BackupModal) => void;
  closeModal: () => void;
}) {
  const [backupName, setBackupName] = useState('');

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
      />
      <View style={styles.footerContainer}>
        <Button
          disabled={backupName.trim().length === 0}
          title={getString('common.ok')}
          onPress={() => {
            closeModal();
            createBackup(host, backupName + '.backup');
          }}
        />
        <Button
          title={getString('common.cancel')}
          onPress={() => setBackupModal(BackupModal.CONNECTED)}
        />
      </View>
    </>
  );
}

function RestoreBackup({
  host,
  theme,
  setBackupModal,
  closeModal,
}: {
  host: string;
  theme: ThemeColors;
  setBackupModal: (backupModal: BackupModal) => void;
  closeModal: () => void;
}) {
  const [backupList, setBackupList] = useState<string[]>([]);
  useEffect(() => {
    list(host).then(items =>
      setBackupList(items.filter(item => item.endsWith('.backup'))),
    );
  }, []);

  return (
    <>
      <FlatList
        contentContainerStyle={styles.backupList}
        data={backupList}
        keyExtractor={(item, index) => item + '_' + index}
        renderItem={({ item }) => (
          <Button
            mode="outlined"
            style={styles.btnOutline}
            onPress={() => {
              closeModal();
              remoteRestore(host, item);
            }}
          >
            <Text style={{ color: theme.primary }}>
              {item.replace(/\.backup$/, ' ')}
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
          onPress={() => setBackupModal(BackupModal.CONNECTED)}
        />
      </View>
    </>
  );
}

function SetHost({
  host,
  setHost,
  theme,
  setBackupModal,
}: {
  host: string;
  setHost: (
    value:
      | string
      | ((current: string | undefined) => string | undefined)
      | undefined,
  ) => void;
  theme: ThemeColors;
  setBackupModal: (backupModal: BackupModal) => void;
}) {
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(false);
  return (
    <>
      <TextInput
        value={host}
        placeholder={getString('backupScreen.remote.host')}
        onChangeText={setHost}
        mode="outlined"
        underlineColor={theme.outline}
        theme={{ colors: { ...theme } }}
        placeholderTextColor={theme.onSurfaceDisabled}
        disabled={fetching}
      />
      {error ? (
        <Text style={[styles.error, { color: theme.error }]}>{error}</Text>
      ) : null}
      <View style={styles.footerContainer}>
        <Button
          disabled={host.trim().length === 0 || fetching}
          title={getString('common.ok')}
          onPress={() => {
            setError('');
            setFetching(true);
            fetchTimeout(host, {}, 2000)
              .then(res => res.json())
              .then(data => {
                if (data.name === 'LNReader') {
                  setBackupModal(BackupModal.CONNECTED);
                } else {
                  throw new Error(getString('backupScreen.remote.unknownHost'));
                }
              })
              .catch((error: any) => {
                setError(error.message);
              })
              .finally(() => {
                setFetching(false);
              });
          }}
        />
      </View>
    </>
  );
}

function Connected({
  theme,
  setBackupModal,
}: {
  theme: ThemeColors;
  setBackupModal: (backupModal: BackupModal) => void;
}) {
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
        title={getString('common.cancel')}
        style={[styles.btnOutline, { borderColor: theme.outline }]}
        onPress={() => setBackupModal(BackupModal.SET_HOST)}
      />
    </>
  );
}

export default function SelfHostModal({
  visible,
  theme,
  closeModal,
}: SelfHostModalProps) {
  const [backupModal, setBackupModal] = useState(BackupModal.SET_HOST);
  const { host, setHost } = useSelfHost();

  const renderModal = () => {
    switch (backupModal) {
      case BackupModal.SET_HOST:
        return (
          <SetHost
            host={host}
            setHost={setHost}
            theme={theme}
            setBackupModal={setBackupModal}
          />
        );
      case BackupModal.CONNECTED:
        return <Connected theme={theme} setBackupModal={setBackupModal} />;
      case BackupModal.CREATE_BACKUP:
        return (
          <CreateBackup
            host={host}
            closeModal={closeModal}
            setBackupModal={setBackupModal}
            theme={theme}
          />
        );
      case BackupModal.RESTORE_BACKUP:
        return (
          <RestoreBackup
            host={host}
            closeModal={closeModal}
            setBackupModal={setBackupModal}
            theme={theme}
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
            {getString('backupScreen.remote.backup')}
          </Text>
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
