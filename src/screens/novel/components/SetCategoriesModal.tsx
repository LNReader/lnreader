import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';
import { Divider, Modal, overlay, Portal } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { Button } from '@components/index';

import { useTheme } from '@hooks/useTheme';

import { getString } from '@strings/translations';
import { getCategoriesFromDb } from '@database/queries/CategoryQueries';
import { updateNovelCategories } from '@database/queries/NovelQueries';
import { Category } from '@database/types';
import { Checkbox } from '@components/Checkbox/Checkbox';
import { xor } from 'lodash-es';

interface SetCategoryModalProps {
  novelIds: number[];
  visible: boolean;
  onEditCategories?: () => void;
  closeModal: () => void;
  onSuccess?: () => void | Promise<void>;
}

const SetCategoryModal: React.FC<SetCategoryModalProps> = ({
  novelIds,
  closeModal,
  visible,
  onSuccess,
  onEditCategories,
}) => {
  const theme = useTheme();
  const { navigate } = useNavigation();
  const [option, setOption] = useState<string>('KEEP_OLD');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [categories = [], setCategories] = useState<Category[]>();

  const getCategories = async () => {
    const res = await getCategoriesFromDb();

    setCategories(res);
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
        onDismiss={() => {
          closeModal();
          setSelectedCategories([]);
        }}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: overlay(2, theme.surface) },
        ]}
      >
        <Text style={[styles.modalTitle, { color: theme.onSurface }]}>
          {getString('categories.setCategories')}
        </Text>
        <FlatList
          data={categories}
          renderItem={({ item }) => (
            <Checkbox
              status={
                selectedCategories.find(category => category.id === item.id) !==
                undefined
              }
              label={item.name}
              onPress={() =>
                setSelectedCategories(xor(selectedCategories, [item]))
              }
              viewStyle={styles.checkboxView}
              theme={theme}
            />
          )}
          ListEmptyComponent={
            <Text
              style={[styles.emptyState, { color: theme.onSurfaceVariant }]}
            >
              {getString('categories.setModalEmptyMsg')}
            </Text>
          }
        />
        <Divider
          style={{
            height: 1,
            width: '90%',
            marginLeft: '5%',
            backgroundColor: theme.onSurfaceDisabled,
          }}
        />
        <View>
          <Text style={[styles.modelOption, { color: theme.onSurface }]}>
            {'Option'}
          </Text>
          <Checkbox
            status={option === 'KEEP_OLD'}
            label={'Keep old categories'}
            onPress={() => setOption('KEEP_OLD')}
            viewStyle={styles.checkboxView}
            theme={theme}
          />
          <Checkbox
            status={option === 'REMOVE_OLD'}
            label={'Remove old categories (not selected)'}
            onPress={() => setOption('REMOVE_OLD')}
            viewStyle={styles.checkboxView}
            theme={theme}
          />
        </View>
        <View style={styles.btnContainer}>
          <Button
            title={getString('common.edit')}
            onPress={() => {
              navigate(
                'MoreStack' as never,
                {
                  screen: 'Categories',
                } as never,
              );
              closeModal();
              onEditCategories?.();
            }}
          />
          <View style={styles.flex} />
          <Button
            title={getString('common.cancel')}
            onPress={() => {
              closeModal();
            }}
          />
          {selectedCategories.length ? (
            <Button
              title={getString('common.ok')}
              onPress={async () => {
                await updateNovelCategories(
                  novelIds,
                  selectedCategories.map(category => category.id),
                  option,
                );
                closeModal();
                setSelectedCategories([]);
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
    maxHeight: (Dimensions.get('window').height * 3) / 4,
  },
  modalTitle: {
    paddingHorizontal: 24,
    fontSize: 24,
    marginBottom: 20,
  },
  modelOption: {
    paddingHorizontal: 24,
    fontSize: 15,
    marginVertical: 10,
  },
  flex: {
    flex: 1,
  },
  btnContainer: {
    paddingHorizontal: 24,
    marginTop: 20,
    flexDirection: 'row',
  },
  checkboxView: {
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  emptyState: {
    paddingHorizontal: 24,
  },
});
