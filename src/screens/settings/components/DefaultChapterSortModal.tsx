import React from 'react';
import { StyleSheet } from 'react-native';

import { Portal, Modal, overlay } from 'react-native-paper';
import { SortItem } from '../../../components/Checkbox/Checkbox';

import { setAppSettings } from '@redux/settings/settingsSliceV1';
import { ThemeColors } from '@theme/types';
import { Dispatch } from '@reduxjs/toolkit';

interface DefaultChapterSortModalProps {
  theme: ThemeColors;
  dispatch: Dispatch;
  defaultChapterSort: string;
  hideDisplayModal: () => void;
  displayModalVisible: boolean;
}

const DefaultChapterSortModal = ({
  theme,
  dispatch,
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
          label="By source"
          theme={theme}
          status={defaultChapterSort === 'ORDER BY id ASC' ? 'asc' : 'desc'}
          onPress={() =>
            defaultChapterSort === 'ORDER BY id ASC'
              ? dispatch(
                  setAppSettings({
                    key: 'defaultChapterSort',
                    value: 'ORDER BY id DESC',
                  }),
                )
              : dispatch(
                  setAppSettings({
                    key: 'defaultChapterSort',
                    value: 'ORDER BY id ASC',
                  }),
                )
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
