import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { ButtonVariation } from '@components/Button/Button';
import { Button } from '@components/index';

import { useTheme } from '@redux/hooks';
import { getString } from '@strings/translations';
import { getCategoriesFromDb } from '../../../database/queries/CategoryQueries';
import { Category } from '../../../database/types';
import { Checkbox } from '@components/Checkbox/Checkbox';
import {
  updateNovelCategoryById,
  updateNovelCategoryByIds,
} from '../../../database/queries/NovelQueries';
import { isArray, xor } from 'lodash';

interface SetCategoryModalProps {
  novelId: number | number[];
  visible: boolean;
  currentCategoryIds: number[];
  onEditCategories?: () => void;
  closeModal: () => void;
  onSuccess?: () => void | Promise<void>;
}

const SetCategoryModal: React.FC<SetCategoryModalProps> = ({
  novelId,
  currentCategoryIds,
  closeModal,
  visible,
  onSuccess,
  onEditCategories,
}) => {
  const theme = useTheme();
  const { navigate } = useNavigation();

  const [selectedCategories, setSelectedCategories] = useState([
    ...currentCategoryIds,
  ]);
  const [categories, setCategories] = useState<Category[]>();

  const getCategories = async () => {
    const res = await getCategoriesFromDb();
    res.shift();

    setCategories(res);
  };

  const handleCloseModal = () => {
    setSelectedCategories([]);
    closeModal();
  };

  useEffect(() => {
    if (visible) {
      getCategories();
    }
  }, [visible]);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleCloseModal}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: theme.colorPrimary },
        ]}
      >
        <Text style={[styles.modalTitle, { color: theme.textColorPrimary }]}>
          {getString('categories.setCategories')}
        </Text>
        <FlatList
          data={categories}
          renderItem={({ item }) => (
            <Checkbox
              status={selectedCategories.includes(item.id)}
              label={item.name}
              onPress={() =>
                setSelectedCategories(prevValues => xor(prevValues, [item.id]))
              }
              viewStyle={styles.checkboxView}
              theme={theme}
            />
          )}
          ListEmptyComponent={
            <Text
              style={[styles.emptyState, { color: theme.textColorSecondary }]}
            >
              {getString('categories.setModalEmptyMsg')}
            </Text>
          }
        />
        <View style={styles.btnContainer}>
          <Button
            title={getString('common.edit')}
            theme={theme}
            variation={ButtonVariation.CLEAR}
            onPress={() => {
              navigate(
                'MoreStack' as never,
                {
                  screen: 'Categories',
                } as never,
              );
              handleCloseModal();
              onEditCategories?.();
            }}
          />
          <View style={styles.flex} />
          <Button
            title={getString('common.cancel')}
            theme={theme}
            variation={ButtonVariation.CLEAR}
            onPress={handleCloseModal}
          />
          {categories?.length ? (
            <Button
              title={getString('common.ok')}
              theme={theme}
              variation={ButtonVariation.CLEAR}
              onPress={() => {
                if (isArray(novelId)) {
                  updateNovelCategoryByIds(novelId, selectedCategories);
                } else {
                  updateNovelCategoryById(novelId, selectedCategories);
                }
                handleCloseModal();
                onSuccess?.();
              }}
            />
          ) : null}
        </View>
      </Modal>
    </Portal>
  );
};

export default SetCategoryModal;

const styles = StyleSheet.create({
  modalContainer: {
    margin: 30,
    paddingVertical: 32,
    borderRadius: 32,
  },
  modalTitle: {
    paddingHorizontal: 24,
    fontSize: 24,
    marginBottom: 16,
  },
  flex: {
    flex: 1,
  },
  btnContainer: {
    paddingHorizontal: 24,
    marginTop: 24,
    flexDirection: 'row',
  },
  checkboxView: {
    paddingHorizontal: 20,
  },
  emptyState: {
    paddingHorizontal: 24,
  },
});
