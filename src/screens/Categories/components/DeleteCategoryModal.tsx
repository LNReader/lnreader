import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Modal, Portal } from 'react-native-paper';

import { Button } from '@components/index';

import { Category } from '@database/types';
import { deleteCategoryById } from '@database/queries/CategoryQueries';
import { useTheme } from '@hooks/persisted';

import { getString } from '@strings/translations';

interface DeleteCategoryModalProps {
  category: Category;
  visible: boolean;
  closeModal: () => void;
  onSuccess: () => Promise<void>;
}

const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
  category,
  closeModal,
  visible,
  onSuccess,
}) => {
  const theme = useTheme();
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={closeModal}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: theme.overlay3 },
        ]}
      >
        <Text style={[styles.modalTitle, { color: theme.onSurface }]}>
          {getString('categories.deleteModal.header')}
        </Text>
        <Text style={[styles.modalDesc, { color: theme.onSurfaceVariant }]}>
          {getString('categories.deleteModal.desc')}
          {` "${category.name}"?`}
        </Text>
        <View style={styles.btnContainer}>
          <Button
            title={getString('common.ok')}
            onPress={() => {
              deleteCategoryById(category);
              closeModal();
              onSuccess();
            }}
          />
          <Button title={getString('common.cancel')} onPress={closeModal} />
        </View>
      </Modal>
    </Portal>
  );
};

export default DeleteCategoryModal;

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
  modalDesc: {},
});
