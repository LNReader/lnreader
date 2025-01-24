import React from 'react';
import { Text, StyleSheet } from 'react-native';

import { Portal, Modal, overlay } from 'react-native-paper';

import { RadioButton } from '@components/RadioButton/RadioButton';
import { ThemeColors } from '@theme/types';
import { getString } from '@strings/translations';
import { useBrowseSettings } from '@hooks/persisted/index';

interface DisplayModeModalProps {
  globalSearchConcurrency: number;
  modalVisible: boolean;
  hideModal: () => void;
  theme: ThemeColors;
}

const ConcurrentSearchesModal: React.FC<DisplayModeModalProps> = ({
  theme,
  globalSearchConcurrency,
  hideModal,
  modalVisible,
}) => {
  const { setBrowseSettings } = useBrowseSettings();

  return (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={hideModal}
        contentContainerStyle={[
          styles.containerStyle,
          { backgroundColor: overlay(2, theme.surface) },
        ]}
      >
        <Text style={[styles.modalHeader, { color: theme.onSurface }]}>
          {getString('browseSettingsScreen.concurrentSearches')}
        </Text>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 50, 100].map(concurrency => (
          <RadioButton
            key={concurrency}
            status={globalSearchConcurrency === concurrency}
            onPress={() =>
              setBrowseSettings({ globalSearchConcurrency: concurrency })
            }
            label={concurrency.toString()}
            theme={theme}
          />
        ))}
      </Modal>
    </Portal>
  );
};

export default ConcurrentSearchesModal;

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
