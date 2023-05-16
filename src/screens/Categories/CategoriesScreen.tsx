import { FlatList, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { FAB, Portal } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { Appbar, EmptyView } from '@components/index';
import AddCategoryModal from './components/AddCategoryModal';

import {
  getAllCategories,
  updateCategoriesOrder,
} from '../../database/queries/CategoryQueries';
import useBoolean from '@hooks/useBoolean';
import { useTheme } from '@hooks/useTheme';
import { getString } from '@strings/translations';

import { Category } from '../../database/types';
import CategoryCard from './components/CategoryCard';
import { orderBy } from 'lodash-es';
import CategorySkeletonLoading from './components/CategorySkeletonLoading';

const CategoriesScreen = () => {
  const theme = useTheme();
  const { goBack } = useNavigation();

  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>();
  // I comment this because there's no Error screen
  // const [error, setError] = useState();

  const getCategories = async () => {
    try {
      let res = await getAllCategories();
      setCategories(res);
    } catch (err) {
      // setError(err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);
  const updateCategorySort = (currentIndex: number, newIndex: number) => {
    const updatedOrderCategories = orderBy(
      categories?.map((category, index) => {
        if (index === currentIndex) {
          return { ...category, sort: newIndex + 1 }; // + 1 because in db, sort start from 1
        }
        if (index === newIndex) {
          return { ...category, sort: currentIndex + 1 };
        }
        return category;
      }),
      'sort',
    );
    setCategories(updatedOrderCategories);
    updateCategoriesOrder(updatedOrderCategories || []);
  };

  const {
    value: categoryModalVisible,
    setTrue: showCategoryModal,
    setFalse: closeCategoryModal,
  } = useBoolean();
  return (
    <>
      <Appbar
        title={getString('categories.header')}
        handleGoBack={goBack}
        theme={theme}
      />
      {isLoading ? (
        <CategorySkeletonLoading width={360.7} height={89.5} theme={theme} />
      ) : (
        <FlatList
          data={categories}
          contentContainerStyle={styles.contentCtn}
          renderItem={({ item, index }) => (
            <CategoryCard
              category={item}
              getCategories={getCategories}
              categoryIndex={index}
              updateCategorySort={updateCategorySort}
              totalCategories={categories?.length || 0}
            />
          )}
          ListEmptyComponent={
            <EmptyView
              icon="Σ(ಠ_ಠ)"
              description={getString('categories.emptyMsg')}
              theme={theme}
            />
          }
        />
      )}
      <FAB
        style={[styles.fab, { backgroundColor: theme.primary }]}
        color={theme.onPrimary}
        label={getString('common.add')}
        uppercase={false}
        onPress={showCategoryModal}
        icon={'plus'}
      />
      <Portal>
        <AddCategoryModal
          visible={categoryModalVisible}
          closeModal={closeCategoryModal}
          onSuccess={getCategories}
        />
      </Portal>
    </>
  );
};

export default CategoriesScreen;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 16,
  },
  contentCtn: {
    flexGrow: 1,
    paddingVertical: 16,
    paddingBottom: 100,
  },
});
