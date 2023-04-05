import React from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, View } from 'react-native';
import { Portal, Modal, overlay, TextInput } from 'react-native-paper';
import { Button } from '@components/index';
import { MD3ThemeType } from '@theme/types';
import { getString } from '@strings/translations';
import { useAppDispatch } from '@redux/hooks';
import { setReaderSettings } from '@redux/settings/settings.actions';
import * as DocumentPicker from 'expo-document-picker';
import { StorageAccessFramework } from 'expo-file-system';

interface CustomCSSModalProps {
  visible: boolean;
  onDismiss: () => void;
  customCSS: string;
  setCustomCSS: (val: string) => void;
  theme: MD3ThemeType;
  title: string;
}

const CustomCSSModal: React.FC<CustomCSSModalProps> = ({
  onDismiss,
  visible,
  customCSS,
  setCustomCSS,
  theme,
  title,
}) => {
  const dispatch = useAppDispatch();

  const openCSS = async () => {
    try {
      const rawCSS = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: false,
        type: 'text/css',
      });
      if (rawCSS.type === 'success') {
        let css = await StorageAccessFramework.readAsStringAsync(rawCSS.uri);
        setCustomCSS(css);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: overlay(2, theme.surface) },
        ]}
      >
        <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={300}>
          <Text style={[styles.modalTitle, { color: theme.onSurface }]}>
            {title}
          </Text>
          <TextInput
            theme={{ colors: { ...theme } }}
            underlineColor={theme.outline}
            value={customCSS}
            onChangeText={setCustomCSS}
            mode="outlined"
            placeholder="Example: body {margin: 10px;}"
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
              onPress={() =>
                dispatch(setReaderSettings('customCSS', customCSS))
              }
              style={styles.button}
              title={getString('common.save')}
              mode="contained"
            />
            <Button
              style={styles.button}
              onPress={openCSS}
              title='Open CSS file'
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
};

export default CustomCSSModal;

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
