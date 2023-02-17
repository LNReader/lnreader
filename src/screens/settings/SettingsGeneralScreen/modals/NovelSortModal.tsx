import React from 'react';
import { Text, StyleSheet } from 'react-native';

import { Portal, Modal, overlay } from 'react-native-paper';

import { useLibrarySettings } from '@hooks/useSettings';
import {
  LibrarySortOrder,
  librarySortOrderList,
} from '@screens/library/constants/constants';
import { MD3ThemeType } from '@theme/types';
import { FlashList } from '@shopify/flash-list';
import { SortItem } from '@components/Checkbox/Checkbox';

interface NovelSortModalProps {
  novelSortModalVisible: boolean;
  hideNovelSortModal: () => void;
  theme: MD3ThemeType;
}

const NovelSortModal: React.FC<NovelSortModalProps> = ({
  novelSortModalVisible,
  hideNovelSortModal,
  theme,
}) => {
  const { sortOrder = LibrarySortOrder.DateAdded_DESC, setLibrarySettings } =
    useLibrarySettings();
  return (
    <Portal>
      <Modal
        visible={novelSortModalVisible}
        onDismiss={hideNovelSortModal}
        contentContainerStyle={[
          styles.container,
          { backgroundColor: overlay(2, theme.surface) },
        ]}
      >
        <Text style={[styles.modalHeader, { color: theme.textColorPrimary }]}>
          Sort Order
        </Text>
        <FlashList
          data={librarySortOrderList}
          extraData={[sortOrder]}
          estimatedItemSize={6}
          renderItem={({ item }) => (
            <SortItem
              label={item.label}
              theme={theme}
              status={
                sortOrder === item.ASC
                  ? 'asc'
                  : sortOrder === item.DESC
                  ? 'desc'
                  : undefined
              }
              onPress={() =>
                setLibrarySettings({
                  sortOrder: sortOrder === item.ASC ? item.DESC : item.ASC,
                })
              }
            />
          )}
        />
      </Modal>
    </Portal>
  );
};

export default NovelSortModal;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    margin: 20,
    borderRadius: 28,
    height: 397.8,
  },
  modalHeader: {
    paddingHorizontal: 24,
    fontSize: 24,
    marginBottom: 10,
  },
  modalDescription: {
    paddingHorizontal: 24,
    fontSize: 16,
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});
