import { FlatList, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { Appbar, EmptyView, SafeAreaView } from '@components/index';
import AddCategoryModal from './components/AddCategoryModal';

import { updateCategoryOrderInDb } from '@database/queries/CategoryQueries';
import { useBoolean } from '@hooks';
import { useTheme } from '@providers/ThemeProvider';
import { getString } from '@strings/translations';

import CategoryCard from './components/CategoryCard';
import { orderBy } from 'lodash-es';
import CategorySkeletonLoading from './components/CategorySkeletonLoading';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLibraryContext } from '@components/Context/LibraryContext';

const CategoriesScreen = () => {
  const { categories, setCategories, refreshCategories, isLoading } =
    useLibraryContext();
  const theme = useTheme();
  const { goBack } = useNavigation();

  const { bottom, right } = useSafeAreaInsets();

  const {
    value: categoryModalVisible,
    setTrue: showCategoryModal,
    setFalse: closeCategoryModal,
  } = useBoolean();

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  const updateCategorySort = (currentIndex: number, newIndex: number) => {
    // Do not set local as default one
    if (
      (newIndex === 0 &&
        currentIndex === 1 &&
        categories?.[currentIndex].id === 2) ||
      (newIndex === 1 && currentIndex === 0 && categories?.[newIndex].id === 2)
    ) {
      return;
    }
    const updatedOrderCategories = orderBy(
      categories?.map((category, index) => {
        // + 1 because in db, sort start from 1

        // swap adjacent cards
        if (index === currentIndex) {
          return { ...category, sort: newIndex + 1 };
        }
        if (index === newIndex) {
          return { ...category, sort: currentIndex + 1 };
        }
        return category;
      }),
      'sort',
    );
    setCategories(updatedOrderCategories);
    updateCategoryOrderInDb(updatedOrderCategories || []);
  };

  return (
    <SafeAreaView excludeTop>
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
              getCategories={refreshCategories}
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
        style={[styles.fab, { backgroundColor: theme.primary, right, bottom }]}
        color={theme.onPrimary}
        label={getString('common.add')}
        uppercase={false}
        onPress={showCategoryModal}
        icon={'plus'}
      />

      <AddCategoryModal
        visible={categoryModalVisible}
        closeModal={closeCategoryModal}
        onSuccess={refreshCategories}
      />
    </SafeAreaView>
  );
};

export default CategoriesScreen;

const styles = StyleSheet.create({
  contentCtn: {
    flexGrow: 1,
    paddingBottom: 100,
    paddingVertical: 16,
  },
  fab: {
    bottom: 16,
    margin: 16,
    position: 'absolute',
    right: 0,
  },
});
