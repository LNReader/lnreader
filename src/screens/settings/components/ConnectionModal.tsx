import { Button } from '@components';
import { getString } from '@strings/translations';
import { ThemeColors } from '@theme/types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Modal, TextInput, overlay } from 'react-native-paper';

interface ConnectionModalProps {
  title: string;
  ipv4: string;
  port: string;
  visible: boolean;
  theme: ThemeColors;
  closeModal: () => void;
  handle: (ipv4: string, port: string) => Promise<void>;
  setIpv4: React.Dispatch<React.SetStateAction<string>>;
  setPort: React.Dispatch<React.SetStateAction<string>>;
}

const ConnectionModal: React.FC<ConnectionModalProps> = ({
  title,
  ipv4,
  port,
  visible,
  theme,
  closeModal,
  handle,
  setIpv4,
  setPort,
}) => {
  return (
    <Modal
      visible={visible}
      onDismiss={closeModal}
      contentContainerStyle={[
        styles.modalContainer,
        { backgroundColor: overlay(2, theme.surface) },
      ]}
    >
      <Text style={[styles.modalTitle, { color: theme.onSurface }]}>
        {title}
      </Text>
      <TextInput
        value={ipv4}
        placeholder={'xxx.xxx.xxx.xxx'}
        onChangeText={setIpv4}
        mode="outlined"
        underlineColor={theme.outline}
        theme={{ colors: { ...theme } }}
        placeholderTextColor={theme.onSurfaceDisabled}
      />
      <TextInput
        value={port}
        onChangeText={setPort}
        mode="outlined"
        underlineColor={theme.outline}
        theme={{ colors: { ...theme } }}
        placeholderTextColor={theme.onSurfaceDisabled}
      />
      <View style={styles.btnContainer}>
        <Button
          title={getString('common.ok')}
          onPress={() => {
            closeModal();
            handle(ipv4, port);
          }}
        />
        <Button title={getString('common.cancel')} onPress={closeModal} />
      </View>
    </Modal>
  );
};

export default ConnectionModal;

const styles = StyleSheet.create({
  modalContainer: {
    margin: 30,
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderRadius: 32,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
  btnContainer: {
    marginTop: 24,
    flexDirection: 'row-reverse',
  },
});
