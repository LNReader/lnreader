import React from 'react';

import { Portal } from 'react-native-paper';
import { RadioButton } from '@components/RadioButton/RadioButton';

import { useSettingsContext } from '@components/Context/SettingsContext';
import { useTheme } from '@providers/Providers';

import { readerFonts } from '@utils/constants/readerConstants';
import { Modal } from '@components';

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
  const { setSettings } = useSettingsContext();

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss}>
        {readerFonts.map(item => (
          <RadioButton
            key={item.fontFamily}
            status={currentFont === item.fontFamily}
            onPress={() => setSettings({ fontFamily: item.fontFamily })}
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
