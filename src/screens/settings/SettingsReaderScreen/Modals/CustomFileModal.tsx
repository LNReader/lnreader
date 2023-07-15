import React, { useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, View } from 'react-native';
import { Modal, overlay, TextInput } from 'react-native-paper';
import { Button } from '@components/index';
import { MD3ThemeType } from '@theme/types';
import { getString } from '@strings/translations';
import { useAppDispatch } from '@redux/hooks';
import * as DocumentPicker from 'expo-document-picker';
import { StorageAccessFramework } from 'expo-file-system';
import { showToast } from '@hooks/showToast';
import { setReaderSettings } from '@redux/settings/settings.actions';

interface CustomCSSModalProps {
  visible: boolean;
  onDismiss: () => void;
  customFile: string;
  setCustomFile: (val: string) => void;
  theme: MD3ThemeType;
  title: string;
  type?: string;
  openFileButtonLabel?: string;
  placeholder?: string;
}

const CustomFileModal: React.FC<CustomCSSModalProps> = ({
  onDismiss,
  visible,
  customFile,
  setCustomFile,
  theme,
  title,
  type = 'CSS',
  openFileButtonLabel = getString(
    'moreScreen.settingsScreen.readerSettings.openCSSFile',
  ),
  placeholder = '',
}) => {
  const [text, setText] = useState(customFile);
  const dispatch = useAppDispatch();
  let mimeType: string;
  if (type === 'CSS') {
    mimeType = 'text/css';
  } else {
    mimeType = 'application/javascript';
  }

  const openCSS = async () => {
    try {
      const rawCSS = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: false,
        type: mimeType,
      });
      if (rawCSS.type === 'success') {
        let css = await StorageAccessFramework.readAsStringAsync(rawCSS.uri);
        setText(css);
      }
    } catch (error: any) {
      showToast(error.message);
    }
  };
  const dismiss = () => {
    setCustomFile(text.trim());
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      onDismiss={dismiss}
      contentContainerStyle={[
        styles.modalContainer,
        { backgroundColor: overlay(2, theme.surface) },
      ]}
    >
      <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={180}>
        <Text style={[styles.modalTitle, { color: theme.onSurface }]}>
          {title}
        </Text>
        <Text style={[{ color: theme.onSurfaceVariant }]}>
          {type === 'CSS'
            ? getString('moreScreen.settingsScreen.readerSettings.cssHint')
            : getString('moreScreen.settingsScreen.readerSettings.jsHint')}
        </Text>
        <TextInput
          theme={{ colors: { ...theme } }}
          underlineColor={theme.outline}
          value={text}
          onChangeText={setText}
          mode="outlined"
          placeholder={placeholder}
          placeholderTextColor={theme.onSurfaceVariant}
          multiline
          style={[
            { color: theme.onSurface },
            styles.fontSizeL,
            styles.customCSSContainer,
          ]}
        />
        <View style={styles.customCSSButtons}>
          <Button
            onPress={() => {
              dispatch(setReaderSettings(`custom${type}`, text.trim()));
              dismiss();
            }}
            style={styles.button}
            title={getString('common.save')}
            mode="contained"
          />
          <Button
            style={styles.button}
            onPress={openCSS}
            title={openFileButtonLabel}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CustomFileModal;

const styles = StyleSheet.create({
  modalContainer: {
    margin: 30,
    padding: 24,
    borderRadius: 28,
  },
  fontSizeL: {
    fontSize: 16,
  },
  customCSSContainer: {
    height: 220,
    borderRadius: 14,
    marginTop: 16,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
  customCSSButtons: {
    flexDirection: 'row-reverse',
  },
  button: {
    marginTop: 16,
    flex: 1,
    marginHorizontal: 8,
  },
});
