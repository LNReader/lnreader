import SafeAreaView from '@components/SafeAreaView/SafeAreaView';
import { useTheme } from '@hooks/persisted';
import React from 'react';
import { StyleSheet } from 'react-native';
import { ModalProps, overlay, Modal as PaperModal } from 'react-native-paper';

const Modal: React.FC<ModalProps> = ({
  children,
  visible,
  onDismiss,
  contentContainerStyle,
  ...props
}) => {
  const theme = useTheme();
  return (
    <SafeAreaView>
      <PaperModal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: overlay(2, theme.surface) },
          contentContainerStyle,
        ]}
        {...props}
      >
        {children}
      </PaperModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    margin: 30,
    padding: 24,
    borderRadius: 28,
    shadowColor: 'transparent', // Modal weird shadow fix
  },
});

export default Modal;
