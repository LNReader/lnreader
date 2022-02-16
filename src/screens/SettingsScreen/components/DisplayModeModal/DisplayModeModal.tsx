import React from 'react';
import {FlatList, StyleSheet} from 'react-native';

import {Portal, Modal} from 'react-native-paper';
import {RadioButton} from '../../../../components';

import {useAppDispatch, useAppearanceSettings} from '../../../../redux/hooks';

import {
  DisplayModes,
  setDisplayMode,
} from '../../../../redux/settings/settingsSlice';
import {ThemeType} from '../../../../theme/types';
import {capitalizeFirstLetter} from '../../../../utils/capitalizeFirstLetter';

interface ModalProps {
  visible: boolean;
  closeModal: () => void;
  theme: ThemeType;
}

const DisplayModeModal: React.FC<ModalProps> = ({
  visible,
  closeModal,
  theme,
}) => {
  const {displayMode} = useAppearanceSettings();
  const dispatch = useAppDispatch();

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={closeModal}
        contentContainerStyle={[
          styles.containerStyle,
          {backgroundColor: theme.surface},
        ]}
      >
        <FlatList
          data={Object.values(DisplayModes)}
          keyExtractor={item => item}
          renderItem={({item}) => (
            <RadioButton
              status={displayMode === item ? 'checked' : 'unchecked'}
              value={displayMode}
              onPress={() => dispatch(setDisplayMode(item))}
              label={capitalizeFirstLetter(item)}
              theme={theme}
            />
          )}
        />
      </Modal>
    </Portal>
  );
};

export default DisplayModeModal;

const styles = StyleSheet.create({
  containerStyle: {
    paddingVertical: 20,
    margin: 20,
    borderRadius: 6,
  },
});
