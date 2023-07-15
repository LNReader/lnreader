import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { getString } from '@strings/translations';
import { Button } from '@components';

import { Modal, TextInput, Text } from 'react-native-paper';
import { useTheme } from '@hooks/useTheme';
import { useSettings } from '@hooks/reduxHooks';
import { openDocumentTree } from 'react-native-saf-x';
import SwitchSetting from '@components/Switch/Switch';
import useBoolean from '@hooks/useBoolean';
import { useDispatch } from 'react-redux';
import { setAppSettings } from '@redux/settings/settings.actions';

interface ChooseEpubLocationModalProps {
  hideModal: () => void;
  modalVisible: boolean;
  onSubmit?: (uri: string) => void;
  dispatchConfig?: boolean;
}

const ChooseEpubLocationModal: React.FC<ChooseEpubLocationModalProps> = ({
  hideModal,
  modalVisible,
  onSubmit: onSubmitProp,
  dispatchConfig,
}) => {
  const theme = useTheme();
  const {
    epubLocation = '',
    epubUseAppTheme = false,
    epubUseCustomCSS = false,
    epubUseCustomJS = false,
  } = useSettings();
  const saveConfig = dispatchConfig || epubLocation === '';
  const dispatch = useDispatch();

  const [uri, setUri] = useState(epubLocation);
  const useAppTheme = useBoolean(epubUseAppTheme);
  const useCustomCSS = useBoolean(epubUseCustomCSS);
  const useCustomJS = useBoolean(epubUseCustomJS);
  const [error, setError] = useState('');

  const onDismiss = () => {
    hideModal();
    setError('');
    setUri(epubLocation);
  };

  const onSubmit = () => {
    if (saveConfig) {
      dispatch(setAppSettings('epubLocation', uri));
      dispatch(setAppSettings('epubUseAppTheme', useAppTheme.value));
      dispatch(setAppSettings('epubUseCustomCSS', useCustomCSS.value));
      dispatch(setAppSettings('epubUseCustomJS', useCustomJS.value));
    }
    onSubmitProp?.(uri);
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
            onChangeText={setUri}
            value={uri}
            placeholder={getString(
              'novelScreen.convertToEpubModal.pathToFolder',
            )}
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
      <View style={styles.settings}>
        <SwitchSetting
          label={getString('novelScreen.convertToEpubModal.useReaderTheme')}
          value={useAppTheme.value}
          onPress={useAppTheme.toggle}
          theme={theme}
        />
        <SwitchSetting
          label={getString('novelScreen.convertToEpubModal.useCustomCSS')}
          value={useCustomCSS.value}
          onPress={useCustomCSS.toggle}
          theme={theme}
        />
        <SwitchSetting
          label={getString('novelScreen.convertToEpubModal.useCustomJS')}
          description={getString(
            'novelScreen.convertToEpubModal.useCustomJSWarning',
          )}
          value={useCustomJS.value}
          onPress={useCustomJS.toggle}
          theme={theme}
        />
      </View>
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
    paddingLeft: 5,
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
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
