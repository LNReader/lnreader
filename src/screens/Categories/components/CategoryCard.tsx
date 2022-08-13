import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { Category } from '../../../database/types';
import { useTheme } from '@redux/hooks';
import AddCategoryModal from './AddCategoryModal';
import useBoolean from '@hooks/useBoolean';
import { Portal } from 'react-native-paper';
import IconButton from '@components/IconButtonV2/IconButtonV2';
import DeleteCategoryModal from './DeleteCategoryModal';

interface CategoryCardProps {
  category: Category;
  getCategories: () => Promise<void>;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  getCategories,
}) => {
  const theme = useTheme();

  const {
    value: categoryModalVisible,
    setTrue: showCategoryModal,
    setFalse: closeCategoryModal,
  } = useBoolean();

  const {
    value: deletecategoryModalVisible,
    setTrue: showDeleteCategoryModal,
    setFalse: closeDeleteCategoryModal,
  } = useBoolean();

  return (
    <>
      <View style={[styles.cardCtn, { backgroundColor: theme.colorPrimary }]}>
        <MaterialCommunityIcons
          name="label-outline"
          color={theme.textColorPrimary}
          size={24}
        />
        <Text style={[styles.name, { color: theme.textColorPrimary }]}>
          {category.name}
        </Text>
        <View style={styles.flex} />
        <IconButton
          name="pencil-outline"
          color={theme.textColorPrimary}
          style={styles.manageBtn}
          onPress={showCategoryModal}
          size={24}
          theme={theme}
        />
        <IconButton
          name="delete-outline"
          color={theme.textColorPrimary}
          style={styles.manageBtn}
          onPress={showDeleteCategoryModal}
          size={24}
          theme={theme}
        />
      </View>
      <Portal>
        <AddCategoryModal
          isEditMode
          category={category}
          visible={categoryModalVisible}
          closeModal={closeCategoryModal}
          onSuccess={getCategories}
        />
        <DeleteCategoryModal
          category={category}
          visible={deletecategoryModalVisible}
          closeModal={closeDeleteCategoryModal}
          onSuccess={getCategories}
        />
      </Portal>
    </>
  );
};

export default CategoryCard;

const styles = StyleSheet.create({
  cardCtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    elevation: 1,
  },
  name: {
    marginHorizontal: 16,
  },
  flex: {
    flex: 1,
  },
  manageBtn: {
    marginLeft: 16,
  },
});
