import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Modal, Portal, TextInput } from 'react-native-paper';

import { ButtonVariation } from '@components/Button/Button';
import { Button } from '@components/index';

import { Category } from '../../../database/types';
import {
  createCategory,
  isCategoryNameDuplicate,
  updateCategory,
} from '../../../database/queries/CategoryQueries';
import { useTheme } from '@redux/hooks';
import { getString } from '@strings/translations';
import { showToast } from '@hooks/showToast';

interface AddCategoryModalProps {
  isEditMode?: boolean;
  category?: Category;
  visible: boolean;
  closeModal: () => void;
  onSuccess: () => Promise<void>;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isEditMode,
  category,
  closeModal,
  visible,
  onSuccess,
}) => {
  const theme = useTheme();
  const [categoryName, setCategoryName] = useState(category?.name || '');

  const textInputTheme = {
    colors: {
      primary: theme.colorAccent,
      placeholder: theme.textColorHint,
      text: theme.textColorPrimary,
      background: 'transparent',
    },
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={closeModal}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: theme.colorPrimary },
        ]}
      >
        <Text style={[styles.modalTitle, { color: theme.textColorPrimary }]}>
          {getString(
            isEditMode
              ? 'categories.editCategories'
              : 'categories.addCategories',
          )}
        </Text>
        <TextInput
          autoFocus
          defaultValue={categoryName}
          placeholder={getString('common.name')}
          onChangeText={setCategoryName}
          mode="outlined"
          theme={textInputTheme}
          underlineColor={theme.textColorHint}
        />
        <View style={styles.btnContainer}>
          <Button
            title={getString(isEditMode ? 'common.ok' : 'common.add')}
            theme={theme}
            variation={ButtonVariation.CLEAR}
            onPress={async () => {
              if (await isCategoryNameDuplicate(categoryName)) {
                showToast(getString('categories.duplicateError'));
              } else {
                if (isEditMode && category) {
                  updateCategory(category?.id, categoryName);
                } else {
                  createCategory(categoryName);
                }
                onSuccess();
              }
              setCategoryName('');
              closeModal();
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

export default AddCategoryModal;

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
