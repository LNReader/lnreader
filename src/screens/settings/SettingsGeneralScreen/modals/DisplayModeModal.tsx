import {
  DisplayModes,
  displayModesList,
} from '@screens/library/constants/constants';
import React from 'react';
import { Text, StyleSheet } from 'react-native';

import { Portal, Modal, overlay } from 'react-native-paper';

import { RadioButton } from '../../../../components/RadioButton/RadioButton';
import { useLibrarySettings } from '@hooks/useSettings';
import { MD3ThemeType } from '@theme/types';

interface DisplayModeModalProps {
  displayMode: DisplayModes;
  displayModalVisible: boolean;
  hideDisplayModal: () => void;
  theme: MD3ThemeType;
}

const DisplayModeModal: React.FC<DisplayModeModalProps> = ({
  theme,
  displayMode,
  hideDisplayModal,
  displayModalVisible,
}) => {
  const { setLibrarySettings } = useLibrarySettings();

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
        <Text style={[styles.modalHeader, { color: theme.textColorPrimary }]}>
          Display Mode
        </Text>
        {displayModesList.map(mode => (
          <RadioButton
            key={mode.value}
            status={displayMode === mode.value}
            onPress={() => setLibrarySettings({ displayMode: mode.value })}
            label={mode.label}
            theme={theme}
          />
        ))}
      </Modal>
    </Portal>
  );
};

export default DisplayModeModal;

const styles = StyleSheet.create({
  containerStyle: {
    paddingVertical: 20,
    margin: 20,
    borderRadius: 28,
  },
  modalHeader: {
    paddingHorizontal: 24,
    fontSize: 24,
    marginBottom: 10,
  },
});
