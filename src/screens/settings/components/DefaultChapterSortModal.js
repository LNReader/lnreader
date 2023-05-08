import React from 'react';
import { StyleSheet } from 'react-native';

import { Portal, Modal, overlay } from 'react-native-paper';
import { SortItem } from '../../../components/Checkbox/Checkbox';

import { setAppSettings } from '../../../redux/settings/settings.actions';

const DefaultChapterSortModal = ({
  theme,
  dispatch,
  defaultChapterSort,
  hideDisplayModal,
  displayModalVisible,
}) => {
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
                  setAppSettings('defaultChapterSort', 'ORDER BY id DESC'),
                )
              : dispatch(
                  setAppSettings('defaultChapterSort', 'ORDER BY id ASC'),
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
