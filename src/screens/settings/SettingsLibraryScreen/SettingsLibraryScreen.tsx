import React from 'react';
import { Appbar, List } from '@components';
import { getString } from '@strings/translations';
import {
  useBoolean,
  useCategories,
  useCategorySettings,
  useTheme,
} from '@hooks';
import { useNavigation } from '@react-navigation/native';
import { Portal } from 'react-native-paper';
import DefaultCategoryDialog from './DefaultCategoryDialog';

const SettingsLibraryScreen = () => {
  const theme = useTheme();
  const { goBack, navigate } = useNavigation();
  const { defaultCategoryId, setCategorySettings } = useCategorySettings();
  const { categories } = useCategories();

  const defaultCategoryDialog = useBoolean();

  const setDefaultCategoryId = (categoryId: number) =>
    setCategorySettings({ defaultCategoryId: categoryId });

  return (
    <>
      <Appbar
        title={getString('library')}
        handleGoBack={goBack}
        theme={theme}
      />
      <List.Section>
        <List.Item
          title={getString('categories.header')}
          description={`${categories.length} ${getString(
            'common.categories',
          ).toLowerCase()}`}
          onPress={() =>
            navigate('MoreStack' as never, { screen: 'Categories' } as never)
          }
          theme={theme}
        />
        <List.Item
          title={getString('categories.defaultCategory')}
          description={categories.find(category => category.sort === 1)?.name}
          onPress={defaultCategoryDialog.setTrue}
          theme={theme}
        />
      </List.Section>
      <Portal>
        <DefaultCategoryDialog
          categories={categories}
          defaultCategoryId={defaultCategoryId || 1}
          visible={defaultCategoryDialog.value}
          hideDialog={defaultCategoryDialog.setFalse}
          setDefaultCategory={setDefaultCategoryId}
        />
      </Portal>
    </>
  );
};

export default SettingsLibraryScreen;
