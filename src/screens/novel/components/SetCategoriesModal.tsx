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
import { isArray } from 'lodash';

interface SetCategoryModalProps {
  novelId: number | number[];
  visible: boolean;
  currentCategoryId: number;
  closeModal: () => void;
  onSuccess?: () => void | Promise<void>;
}

const SetCategoryModal: React.FC<SetCategoryModalProps> = ({
  novelId,
  currentCategoryId,
  closeModal,
  visible,
  onSuccess,
}) => {
  const theme = useTheme();
  const { navigate } = useNavigation();

  const [selectedCategory, setSelectedCategory] = useState(currentCategoryId);
  const [categories, setCategories] = useState<Category[]>();

  const getCategories = async () => {
    const res = await getCategoriesFromDb();
    res.shift();

    setCategories(res);
  };

  useEffect(() => {
    getCategories();
  }, []);

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
          {getString('categories.setCategories')}
        </Text>
        <FlatList
          data={categories}
          renderItem={({ item }) => (
            <Checkbox
              status={selectedCategory === item.id}
              label={item.name}
              onPress={() =>
                setSelectedCategory(
                  !(selectedCategory === item.id) ? item.id : 1,
                )
              }
              viewStyle={styles.checkboxView}
              theme={theme}
            />
          )}
        />
        <View style={styles.btnContainer}>
          <Button
            title={getString('common.edit')}
            theme={theme}
            variation={ButtonVariation.CLEAR}
            onPress={() =>
              navigate(
                'MoreStack' as never,
                {
                  screen: 'Categories',
                } as never,
              )
            }
          />
          <View style={styles.flex} />
          <Button
            title={getString('common.cancel')}
            theme={theme}
            variation={ButtonVariation.CLEAR}
            onPress={closeModal}
          />
          <Button
            title={getString('common.ok')}
            theme={theme}
            variation={ButtonVariation.CLEAR}
            onPress={() => {
              if (isArray(novelId)) {
                updateNovelCategoryByIds(novelId, selectedCategory);
              } else {
                updateNovelCategoryById(novelId, selectedCategory);
              }
              closeModal();
              onSuccess();
            }}
          />
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
});
