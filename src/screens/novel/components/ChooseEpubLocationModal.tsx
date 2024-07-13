import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Modal, TextInput, Text } from 'react-native-paper';
import { openDocumentTree } from 'react-native-saf-x';

import { Button, List, SwitchItem } from '@components';

import { useBoolean } from '@hooks';
import { getString } from '@strings/translations';
import { useChapterReaderSettings, useTheme } from '@hooks/persisted';
import { showToast } from '@utils/showToast';

interface ChooseEpubLocationModalProps {
  isVisible: boolean;
  onSubmit?: (uri: string) => void;
  hideModal: () => void;
}

const ChooseEpubLocationModal: React.FC<ChooseEpubLocationModalProps> = ({
  isVisible,
  onSubmit: onSubmitProp,
  hideModal,
}) => {
  const theme = useTheme();
  const {
    epubLocation = '',
    epubUseAppTheme = false,
    epubUseCustomCSS = false,
    epubUseCustomJS = false,
    setChapterReaderSettings,
  } = useChapterReaderSettings();

  const [uri, setUri] = useState(epubLocation);
  const useAppTheme = useBoolean(epubUseAppTheme);
  const useCustomCSS = useBoolean(epubUseCustomCSS);
  const useCustomJS = useBoolean(epubUseCustomJS);

  const onDismiss = () => {
    hideModal();
    setUri(epubLocation);
  };

  const onSubmit = () => {
    setChapterReaderSettings({
      epubLocation: uri,
      epubUseAppTheme: useAppTheme.value,
      epubUseCustomCSS: useCustomCSS.value,
      epubUseCustomJS: useCustomJS.value,
    });

    onSubmitProp?.(uri);
    hideModal();
  };

  const openFolderPicker = async () => {
    try {
      const resultUri = await openDocumentTree(true);
      if (resultUri) {
        setUri(resultUri.uri);
      }
    } catch (error: any) {
      showToast(error.message);
    }
  };

  return (
    <Modal
      visible={isVisible}
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
        <TextInput
          onChangeText={setUri}
          value={uri}
          placeholder={getString('novelScreen.convertToEpubModal.pathToFolder')}
          onSubmitEditing={onSubmit}
          mode="outlined"
          theme={{ colors: { ...theme } }}
          underlineColor={theme.outline}
          dense
          right={
            <TextInput.Icon
              icon="folder-edit-outline"
              onPress={openFolderPicker}
            />
          }
        />
      </View>
      <View style={styles.settings}>
        <SwitchItem
          label={getString('novelScreen.convertToEpubModal.useReaderTheme')}
          value={useAppTheme.value}
          onPress={useAppTheme.toggle}
          theme={theme}
        />
        <SwitchItem
          label={getString('novelScreen.convertToEpubModal.useCustomCSS')}
          value={useCustomCSS.value}
          onPress={useCustomCSS.toggle}
          theme={theme}
        />
        <SwitchItem
          label={getString('novelScreen.convertToEpubModal.useCustomJS')}
          description={getString(
            'novelScreen.convertToEpubModal.useCustomJSWarning',
          )}
          value={useCustomJS.value}
          onPress={useCustomJS.toggle}
          theme={theme}
        />
      </View>
      <List.InfoItem
        title={getString('novelScreen.convertToEpubModal.chaptersWarning')}
        theme={theme}
      />
      <View style={styles.modalFooterCtn}>
        <Button title={getString('common.submit')} onPress={onSubmit} />
        <Button title={getString('common.cancel')} onPress={hideModal} />
      </View>
    </Modal>
  );
};

export default ChooseEpubLocationModal;

const styles = StyleSheet.create({
  modalContainer: {
    margin: 30,
    borderRadius: 32,
  },
  settings: {
    marginTop: 12,
    padding: 24,
  },
  modalHeaderCtn: {
    padding: 20,
    paddingTop: 32,
    paddingBottom: 0,
  },
  modalFooterCtn: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
});
