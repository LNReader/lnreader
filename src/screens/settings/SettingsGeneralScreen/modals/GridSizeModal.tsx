import React from 'react';
import { Text, StyleSheet } from 'react-native';

import { Portal } from 'react-native-paper';

import { RadioButton } from '@components/RadioButton/RadioButton';

import { ThemeColors } from '@theme/types';
import { useLibrarySettings } from '@hooks/persisted';
import { getString } from '@strings/translations';
import { Modal } from '@components';

interface GridSizeModalProps {
  novelsPerRow: number;
  gridSizeModalVisible: boolean;
  hideGridSizeModal: () => void;
  theme: ThemeColors;
}

const GridSizeModal: React.FC<GridSizeModalProps> = ({
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
      <Modal visible={gridSizeModalVisible} onDismiss={hideGridSizeModal}>
        <Text style={[styles.modalHeader, { color: theme.onSurface }]}>
          {getString('generalSettingsScreen.gridSize')}
        </Text>
        <Text
          style={[styles.modalDescription, { color: theme.onSurfaceVariant }]}
        >
          {getString('generalSettingsScreen.gridSizeDesc', {
            num: novelsPerRow,
          })}
        </Text>
        {Object.keys(gridSizes).map(item => {
          let it = Number(item);
          return (
            <RadioButton
              key={item}
              status={it === novelsPerRow}
              // @ts-ignore
              label={gridSizes[it]}
              onPress={() => setLibrarySettings({ novelsPerRow: it })}
              theme={theme}
            />
          );
        })}
      </Modal>
    </Portal>
  );
};

export default GridSizeModal;

const styles = StyleSheet.create({
  modalHeader: {
    fontSize: 24,
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});
