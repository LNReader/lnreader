import React from 'react';
import { StyleSheet } from 'react-native';

import { Portal, Modal } from 'react-native-paper';

import { RadioButton } from '@components/RadioButton/RadioButton';

import { useAppDispatch, useTheme } from '@redux/hooks';
import { setReaderSettings } from '../../../redux/settings/settings.actions';

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
          { backgroundColor: theme.colorPrimaryDark },
        ]}
      >
        {readerFonts.map(item => (
          <RadioButton
            key={item.fontFamily}
            status={currentFont === item.fontFamily}
            onPress={() =>
              dispatch(setReaderSettings('fontFamily', item.fontFamily))
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
    paddingVertical: 20,
    margin: 20,
    borderRadius: 6,
  },
});
