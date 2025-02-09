import React from 'react';

import { Portal } from 'react-native-paper';
import { SortItem } from '@components/Checkbox/Checkbox';

import { ThemeColors } from '@theme/types';
import { AppSettings } from '@hooks/persisted/useSettings';
import { getString } from '@strings/translations';
import { Modal } from '@components';

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
      <Modal visible={displayModalVisible} onDismiss={hideDisplayModal}>
        <SortItem
          label={getString('generalSettingsScreen.bySource')}
          theme={theme}
          status={
            defaultChapterSort === 'ORDER BY position ASC' ? 'asc' : 'desc'
          }
          onPress={() =>
            defaultChapterSort === 'ORDER BY position ASC'
              ? setAppSettings({
                  defaultChapterSort: 'ORDER BY position DESC',
                })
              : setAppSettings({ defaultChapterSort: 'ORDER BY position ASC' })
          }
        />
      </Modal>
    </Portal>
  );
};

export default DefaultChapterSortModal;
