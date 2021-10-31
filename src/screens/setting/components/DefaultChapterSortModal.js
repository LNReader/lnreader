import React from 'react';
import {StyleSheet} from 'react-native';

import {Portal, Modal} from 'react-native-paper';
import {SortItem} from '../../../components/Checkbox/Checkbox';

import {setAppSettings} from '../../../redux/settings/settings.actions';

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
          {backgroundColor: theme.colorPrimaryDark},
        ]}
      >
        <SortItem
          label="By source"
          theme={theme}
          status={
            defaultChapterSort === 'ORDER BY chapterId ASC' ? 'asc' : 'desc'
          }
          onPress={() =>
            defaultChapterSort === 'ORDER BY chapterId ASC'
              ? dispatch(
                  setAppSettings(
                    'defaultChapterSort',
                    'ORDER BY chapterId DESC',
                  ),
                )
              : dispatch(
                  setAppSettings(
                    'defaultChapterSort',
                    'ORDER BY chapterId ASC',
                  ),
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
