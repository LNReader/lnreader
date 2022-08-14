import { StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { FAB, Portal } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { Appbar, EmptyView } from '@components/index';
import AddCategoryModal from './components/AddCategoryModal';

import { getCategoriesFromDb } from '../../database/queries/CategoryQueries';
import useBoolean from '@hooks/useBoolean';
import { useTheme } from '@redux/hooks';
import { getString } from '@strings/translations';

import { Category } from '../../database/types';
import { FlashList } from '@shopify/flash-list';
import CategoryCard from './components/CategoryCard';

const CategoriesScreen = () => {
  const theme = useTheme();
  const { goBack } = useNavigation();

  const [categories, setCategories] = useState<Category[]>();
  const [error, setError] = useState();

  const getCategories = async () => {
    try {
      const res = await getCategoriesFromDb();
      res.shift(); // Remove Default Category

      setCategories(res);
    } catch (err) {
      setError(error?.message);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

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
      {categories?.length ? (
        <FlashList
          estimatedItemSize={10}
          data={categories}
          contentContainerStyle={styles.contentCtn}
          renderItem={({ item }) => (
            <CategoryCard category={item} getCategories={getCategories} />
          )}
        />
      ) : (
        <EmptyView
          icon="Σ(ಠ_ಠ)"
          description={getString('categories.emptyMsg')}
          theme={theme}
        />
      )}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colorAccent }]}
        color={theme.colorButtonText}
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
    paddingVertical: 16,
    paddingBottom: 100,
  },
});
