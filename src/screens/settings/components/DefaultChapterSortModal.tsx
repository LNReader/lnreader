import React from 'react';
import { StyleSheet } from 'react-native';

import { Portal, Modal, overlay } from 'react-native-paper';
import { SortItem } from '@components/Checkbox/Checkbox';

import { ThemeColors } from '@theme/types';
import { AppSettings } from '@hooks/persisted/useSettings';
import { getString } from '@strings/translations';

interface DefaultChapterSortModalProps {
  theme: ThemeColors;
  setAppSettings: (values: Partial<AppSettings>) => void;
  defaultChapterSort: string;
  hideDisplayModal: () => void;
  displayModalVisible: boolean;
}

const DefaultChapterSortModal = ({
  theme,
  setAppSettings,
  defaultChapterSort,
  hideDisplayModal,
  displayModalVisible,
}: DefaultChapterSortModalProps) => {
  return (
    <Portal>
      <Modal
        visible={displayModalVisible}
        onDismiss={hideDisplayModal}
        contentContainerStyle={[
          styles.containerStyle,
          { backgroundColor: overlay(2, theme.surface) },
        ]}
      >
        <SortItem
          label={getString('generalSettingsScreen.bySource')}
          theme={theme}
          status={defaultChapterSort === 'ORDER BY id ASC' ? 'asc' : 'desc'}
          onPress={() =>
            defaultChapterSort === 'ORDER BY id ASC'
              ? setAppSettings({ defaultChapterSort: 'ORDER BY id DESC' })
              : setAppSettings({ defaultChapterSort: 'ORDER BY id ASC' })
          }
        />
      </Modal>
    </Portal>
  );
};

export default DefaultChapterSortModal;

const styles = StyleSheet.create({
  containerStyle: {
    paddingVertical: 20,
    margin: 20,
    borderRadius: 6,
  },
});
