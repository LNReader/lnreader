import React from 'react';
import {FlatList, StyleSheet} from 'react-native';

import {Portal, Modal} from 'react-native-paper';
import {RadioButton, Text} from '../../../../components';

import {useAppDispatch, useAppearanceSettings} from '../../../../redux/hooks';
import {setGridSizPotrait} from '../../../../redux/settings/settingsSlice';
import {ThemeType} from '../../../../theme/types';
import {GridSizes} from '../../utils/constants';

interface ModalProps {
  visible: boolean;
  closeModal: () => void;
  theme: ThemeType;
}

const GridSizeModal: React.FC<ModalProps> = ({visible, closeModal, theme}) => {
  const {novelsPerRowPotrait} = useAppearanceSettings();
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
        <Text
          color={theme.textColorPrimary}
          size={16}
          paddingHorizontal={20}
          paddingVertical={8}
        >
          Grid Size
        </Text>
        <Text
          color={theme.textColorSecondary}
          size={16}
          paddingHorizontal={20}
          paddingVertical={4}
        >
          {novelsPerRowPotrait}
        </Text>
        <FlatList
          data={Object.keys(GridSizes)}
          keyExtractor={item => item.toString()}
          renderItem={({item}) => (
            <RadioButton
              status={novelsPerRowPotrait === item ? 'checked' : 'unchecked'}
              onPress={() => dispatch(setGridSizPotrait(item))}
              label={GridSizes[item]}
              theme={theme}
            />
          )}
        />
      </Modal>
    </Portal>
  );
};

export default GridSizeModal;

const styles = StyleSheet.create({
  containerStyle: {
    paddingVertical: 20,
    margin: 20,
    borderRadius: 6,
  },
});
