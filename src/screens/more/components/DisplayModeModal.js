import { displayModesList } from '@screens/library/constants/constants';
import React from 'react';
import { StyleSheet } from 'react-native';

import { Portal, Modal } from 'react-native-paper';

import { RadioButton } from '../../../components/RadioButton/RadioButton';
import { useLibrarySettings } from '@hooks/useSettings';

const DisplayModeModal = ({
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
          { backgroundColor: theme.colorPrimaryDark },
        ]}
      >
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
});
