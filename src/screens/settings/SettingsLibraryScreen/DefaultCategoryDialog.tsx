import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Button, Dialog } from 'react-native-paper';

import { RadioButton } from '@components';

import { getString } from '@strings/translations';
import { useTheme } from '@hooks/persisted';

import { Category } from '@database/types';

interface DefaultCategoryDialogProps {
  visible: boolean;
  hideDialog: () => void;
  categories: Category[];
  defaultCategoryId: number;
  setDefaultCategory: (categoryId: number) => void;
}

const DefaultCategoryDialog: React.FC<DefaultCategoryDialogProps> = ({
  categories,
  defaultCategoryId,
  hideDialog,
  visible,
  setDefaultCategory,
}) => {
  const theme = useTheme();

  return (
    <Dialog
      visible={visible}
      onDismiss={hideDialog}
      style={{ backgroundColor: theme.overlay3 }}
    >
      <Dialog.Title style={{ color: theme.onSurface }}>
        {getString('categories.defaultCategory')}
      </Dialog.Title>
      <FlatList
        style={styles.scrollArea}
        initialNumToRender={10}
        data={categories}
        renderItem={({ item }) => (
          <RadioButton
            status={item.id === defaultCategoryId}
            label={item.name}
            onPress={() => setDefaultCategory(item.id)}
            theme={theme}
          />
        )}
      />
      <Dialog.Actions>
        <Button
          theme={{ colors: { primary: theme.primary } }}
          onPress={hideDialog}
        >
          {getString('common.cancel')}
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
};

export default DefaultCategoryDialog;

const styles = StyleSheet.create({
  scrollArea: {
    maxHeight: 480,
  },
});
