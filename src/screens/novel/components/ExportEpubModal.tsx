import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import { openDocumentTree } from 'react-native-saf-x';

import { Button, List, Modal, SwitchItem } from '@components';

import { useBoolean } from '@hooks';
import { getString } from '@strings/translations';
import { useChapterReaderSettings, useTheme } from '@hooks/persisted';
import { showToast } from '@utils/showToast';

interface ExportEpubModalProps {
  isVisible: boolean;
  onSubmit?: (uri: string) => void;
  hideModal: () => void;
}

const ExportEpubModal: React.FC<ExportEpubModalProps> = ({
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
    <Modal visible={isVisible} onDismiss={onDismiss}>
      <View>
        <Text style={[styles.modalTitle, { color: theme.onSurface }]}>
          {getString('novelScreen.exportEpubModal.title')}
        </Text>
        <TextInput
          onChangeText={setUri}
          value={uri}
          placeholder={getString('novelScreen.exportEpubModal.selectFolder')}
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
          label={getString('novelScreen.exportEpubModal.applyReaderTheme')}
          value={useAppTheme.value}
          onPress={useAppTheme.toggle}
          theme={theme}
        />
        <SwitchItem
          label={getString('novelScreen.exportEpubModal.includeCustomCSS')}
          value={useCustomCSS.value}
          onPress={useCustomCSS.toggle}
          theme={theme}
        />
        <SwitchItem
          label={getString('novelScreen.exportEpubModal.includeCustomJS')}
          description={getString('novelScreen.exportEpubModal.customJSWarning')}
          value={useCustomJS.value}
          onPress={useCustomJS.toggle}
          theme={theme}
        />
      </View>
      <List.InfoItem
        style={styles.infoItem}
        title={getString('novelScreen.exportEpubModal.downloadedChaptersOnly')}
        theme={theme}
      />
      <View style={styles.modalFooterCtn}>
        <Button title={getString('common.submit')} onPress={onSubmit} />
        <Button title={getString('common.cancel')} onPress={hideModal} />
      </View>
    </Modal>
  );
};

export default ExportEpubModal;

const styles = StyleSheet.create({
  infoItem: {
    paddingHorizontal: 0,
  },

  modalFooterCtn: {
    flexDirection: 'row-reverse',

    paddingBottom: 20,
    paddingTop: 8,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
  settings: {
    marginTop: 12,
  },
});
