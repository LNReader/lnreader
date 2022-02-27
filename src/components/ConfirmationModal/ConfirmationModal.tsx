import React from 'react';

import {Button, Dialog, Portal} from 'react-native-paper';
import {ThemeType} from '../../theme/types';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  closeModal: () => void;
  theme: ThemeType;
  onPress: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  closeModal,
  theme,
  onPress,
}) => {
  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={closeModal}
        style={{
          borderRadius: 8,
          backgroundColor: theme.surface,
        }}
      >
        <Dialog.Title
          style={{
            letterSpacing: 0,
            fontSize: 16,
            color: theme.textColorPrimary,
          }}
        >
          {title}
        </Dialog.Title>
        <Dialog.Actions>
          <Button
            uppercase={false}
            theme={{colors: {primary: theme.primary}}}
            onPress={closeModal}
            labelStyle={{letterSpacing: 0}}
          >
            Cancel
          </Button>
          <Button
            uppercase={false}
            theme={{colors: {primary: theme.primary}}}
            onPress={onPress}
            labelStyle={{letterSpacing: 0}}
          >
            Ok
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default ConfirmationModal;
