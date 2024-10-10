import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Modal, overlay, TextInput } from 'react-native-paper';
import { Button } from '@components/index';
import { useTheme } from '@hooks/persisted';
import { getString } from '@strings/translations';
import { Storage } from '@plugins/helpers/storage';

interface SourceSettingsModal {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  placeholder?: string;
  description?: string;
  pluginId: string;
}

const SourceSettingsModal: React.FC<SourceSettingsModal> = ({
  onDismiss,
  visible,
  title,
  placeholder,
  description,
  pluginId,
}) => {
  const theme = useTheme();
  const [text, setText] = useState('');

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={[
        styles.modalContainer,
        { backgroundColor: overlay(2, theme.surface) },
      ]}
    >
      <Text style={[styles.modalTitle, { color: theme.onSurface }]}>
        {title}
      </Text>
      <Text style={[{ color: theme.onSurfaceVariant }]}>{description}</Text>
      <TextInput
        multiline
        mode="outlined"
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={theme.onSurfaceDisabled}
        underlineColor={theme.outline}
        style={[{ color: theme.onSurface }, styles.textInput]}
        theme={{ colors: { ...theme } }}
      />
      <View style={styles.customCSSButtons}>
        <Button
          onPress={() => {
            const settings = text
              .trim()
              .split(';')
              .map(settingString => {
                const settingArray = settingString.split('=');

                return {
                  key: settingArray[0],
                  value: settingArray[1],
                };
              });
            const storage = new Storage(pluginId);
            settings.forEach(set => storage.set(set.key, set.value));
            onDismiss();
          }}
          style={styles.button}
          title={getString('common.save')}
          mode="contained"
        />
      </View>
    </Modal>
  );
};

export default SourceSettingsModal;

const styles = StyleSheet.create({
  modalContainer: {
    margin: 30,
    padding: 24,
    borderRadius: 28,
  },
  textInput: {
    height: 220,
    borderRadius: 14,
    marginTop: 16,
    marginBottom: 8,
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
  customCSSButtons: {
    flexDirection: 'row',
  },
  button: {
    marginTop: 16,
    flex: 1,
    marginHorizontal: 8,
  },
});
