import React from 'react';
import { Text, StyleSheet } from 'react-native';

import { Portal, Modal, overlay } from 'react-native-paper';

import { RadioButton } from '../../../components/RadioButton/RadioButton';

import { useLibrarySettings } from '@hooks/useSettings';

const GridSizeModal = ({
  novelsPerRow,
  gridSizeModalVisible,
  hideGridSizeModal,
  theme,
}) => {
  const { setLibrarySettings } = useLibrarySettings();

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
          { backgroundColor: overlay(2, theme.surface) },
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
            status={item == novelsPerRow}
            label={gridSizes[item]}
            onPress={() => setLibrarySettings({ novelsPerRow: item })}
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
    paddingVertical: 24,
    margin: 20,
    borderRadius: 28,
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
