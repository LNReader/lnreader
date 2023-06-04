import { Button } from '@components';
import { showToast } from '@hooks/showToast';
import { getString } from '@strings/translations';
import { ThemeColors } from '@theme/types';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Modal, TextInput, overlay } from 'react-native-paper';

interface ConnectionModalProps {
  visible: boolean;
  theme: ThemeColors;
  closeModal: () => void;
  handle: (ipv4: string, port: string) => Promise<void>;
}

const ConnectionModal: React.FC<ConnectionModalProps> = ({
  visible,
  theme,
  closeModal,
  handle,
}) => {
  const [ipv4, setIpv4] = useState('');
  const [port, setPort] = useState('8000');
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
        {'IPv4 address and port'}
      </Text>
      <TextInput
        placeholder={'xxx.xxx.xxx.xxx'}
        onChangeText={setIpv4}
        mode="outlined"
        underlineColor={theme.outline}
        theme={{ colors: { ...theme } }}
        placeholderTextColor={theme.onSurfaceDisabled}
      />
      <TextInput
        defaultValue={port}
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
            console.log(ipv4, port);
            fetch(`http://${ipv4}:${port}/`)
              .then(res => {
                if (res.ok) {
                  closeModal();
                  handle(ipv4, port);
                } else {
                  showToast('Invalid request!');
                }
              })
              .catch(() => {
                showToast('Request failed!');
              });
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
