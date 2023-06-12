import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { getString } from '@strings/translations';
import { Button } from '@components';

import { Modal, Portal, TextInput, Text } from 'react-native-paper';
import { useTheme } from '@hooks/useTheme';
import { useSettings } from '@hooks/reduxHooks';
import { openDocumentTree } from 'react-native-saf-x';

interface ChooseEpubLocationModalProps {
  hideModal: () => void;
  modalVisible: boolean;
  onSubmit: (uri: string) => void;
}

const ChooseEpubLocationModal: React.FC<ChooseEpubLocationModalProps> = ({
  hideModal,
  modalVisible,
  onSubmit: onSubmitProp,
}) => {
  const { epubLocation = '' } = useSettings();
  const theme = useTheme();
  const [uri, setUri] = useState(epubLocation);
  const [error, setError] = useState('');

  const onDismiss = () => {
    hideModal();
    setError('');
    setUri(epubLocation);
  };

  const onChangeText = (txt: string) => {
    setUri(txt);
  };

  const onSubmit = () => {
    onSubmitProp(uri);
    hideModal();
  };

  const openFolderPicker = async () => {
    try {
      const resultUri = await openDocumentTree(true);
      if (resultUri) {
        setUri(resultUri.uri);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: theme.overlay3 },
        ]}
      >
        <View style={styles.modalHeaderCtn}>
          <Text style={[styles.modalTitle, { color: theme.onSurface }]}>
            {getString('novelScreen.convertToEpubModal.chooseLocation')}
          </Text>
          <View style={styles.row}>
            <TextInput
              style={styles.textInput}
              value={uri}
              placeholder={getString(
                'novelScreen.convertToEpubModal.pathToFolder',
              )}
              onChangeText={onChangeText}
              onSubmitEditing={onSubmit}
              mode="outlined"
              theme={{ colors: { ...theme } }}
              underlineColor={theme.outline}
              dense
              error={error ? true : false}
              right={
                <TextInput.Icon
                  icon="folder-edit-outline"
                  onPress={openFolderPicker}
                />
              }
            />
          </View>
        </View>
        <View style={styles.modalFooterCtn}>
          <Button title={getString('common.submit')} onPress={onSubmit} />
          <Button title={getString('common.cancel')} onPress={hideModal} />
        </View>
      </Modal>
    </Portal>
  );
};

export default ChooseEpubLocationModal;

const styles = StyleSheet.create({
  modalContainer: {
    margin: 30,
    borderRadius: 32,
  },
  icon: { marginVertical: 0, marginRight: 0 },
  textInput: { flex: 1 },
  modalHeaderCtn: {
    padding: 20,
    paddingTop: 32,
    paddingBottom: 0,
  },
  modalFooterCtn: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
  errorText: {
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  marginVertical: {
    marginVertical: 8,
  },
  flashlist: {
    marginTop: 8,
    height: 300,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  listContentCtn: {
    paddingVertical: 8,
  },
  dateCtn: {
    fontSize: 12,
    marginTop: 2,
  },
  listElementContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
});
