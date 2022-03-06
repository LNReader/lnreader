import React from 'react';
import { Text, StyleSheet } from 'react-native';

import { Portal, Modal } from 'react-native-paper';

import { RadioButton } from '../../../components/RadioButton/RadioButton';

import { setNovelsPerRow } from '../../../redux/settings/settings.actions';

const GridSizeModal = ({
  dispatch,
  novelsPerRow,
  gridSizeModalVisible,
  hideGridSizeModal,
  theme,
}) => {
  const gridSizes = {
    5: 'XS',
    4: 'S',
    3: 'M',
    2: 'L',
    1: 'XL',
  };

  return (
    <Portal>
      <Modal
        visible={gridSizeModalVisible}
        onDismiss={hideGridSizeModal}
        contentContainerStyle={[
          styles.container,
          { backgroundColor: theme.colorPrimaryDark },
        ]}
      >
        <Text style={[styles.modalHeader, { color: theme.textColorPrimary }]}>
          Grid size
        </Text>
        <Text
          style={[styles.modalDescription, { color: theme.textColorSecondary }]}
        >
          {`${novelsPerRow} per row`}
        </Text>
        {Object.keys(gridSizes).map(item => (
          <RadioButton
            key={item}
            status={item === novelsPerRow}
            label={gridSizes[item]}
            onPress={() => dispatch(setNovelsPerRow(item))}
            theme={theme}
            style={{ paddingHorizontal: 20 }}
          />
        ))}
      </Modal>
    </Portal>
  );
};

export default GridSizeModal;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    margin: 20,
    borderRadius: 6,
  },
  modalHeader: {
    paddingHorizontal: 20,
    fontSize: 18,
    marginBottom: 10,
  },
  modalDescription: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});
