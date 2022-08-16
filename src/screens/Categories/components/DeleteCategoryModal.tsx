import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Modal, Portal } from 'react-native-paper';

import { ButtonVariation } from '@components/Button/Button';
import { Button } from '@components/index';

import { Category } from '../../../database/types';
import { deleteCategoryById } from '../../../database/queries/CategoryQueries';
import { useTheme } from '@hooks/useTheme';

import { getString } from '@strings/translations';
import { resetCategoryIdsToDefault } from '../../../database/queries/NovelQueriesV2';
import { getDialogBackground } from '../../../theme/colors';

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
          { backgroundColor: getDialogBackground(theme) },
        ]}
      >
        <Text style={[styles.modalTitle, { color: theme.textColorPrimary }]}>
          {getString('categories.deleteModal.header')}
        </Text>
        <Text style={[styles.modalDesc, { color: theme.textColorSecondary }]}>
          {getString('categories.deleteModal.desc')}
          {` "${category.name}"?`}
        </Text>
        <View style={styles.btnContainer}>
          <Button
            title={getString('common.ok')}
            theme={theme}
            variation={ButtonVariation.CLEAR}
            onPress={() => {
              deleteCategoryById(category.id);
              resetCategoryIdsToDefault(category.id);
              closeModal();
              onSuccess();
            }}
          />
          <Button
            title={getString('common.cancel')}
            theme={theme}
            variation={ButtonVariation.CLEAR}
            onPress={closeModal}
          />
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
