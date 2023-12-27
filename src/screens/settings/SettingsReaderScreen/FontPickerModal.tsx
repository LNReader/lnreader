import React from 'react';
import { StyleSheet } from 'react-native';

import { Portal, Modal, overlay } from 'react-native-paper';
import { RadioButton } from '@components/RadioButton/RadioButton';

import { useAppDispatch } from '@redux/hooks';
import { useTheme } from '@hooks/useTheme';
import { setReaderSettings } from '@redux/settings/settingsSliceV1';

import { readerFonts } from '../../../utils/constants/readerConstants';

interface FontPickerModalProps {
  visible: boolean;
  onDismiss: () => void;
  currentFont: string;
}

const FontPickerModal: React.FC<FontPickerModalProps> = ({
  currentFont,
  onDismiss,
  visible,
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.containerStyle,
          { backgroundColor: overlay(2, theme.surface) },
        ]}
      >
        {readerFonts.map(item => (
          <RadioButton
            key={item.fontFamily}
            status={currentFont === item.fontFamily}
            onPress={() =>
              dispatch(
                setReaderSettings({
                  key: 'fontFamily',
                  value: item.fontFamily,
                }),
              )
            }
            label={item.name}
            labelStyle={{ fontFamily: item.fontFamily }}
            theme={theme}
          />
        ))}
      </Modal>
    </Portal>
  );
};

export default FontPickerModal;

const styles = StyleSheet.create({
  containerStyle: {
    paddingVertical: 24,
    margin: 20,
    borderRadius: 28,
  },
});
