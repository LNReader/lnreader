import React from 'react';
import { StyleSheet } from 'react-native';

import { getString } from '@strings/translations';

import { Dialog, Portal } from 'react-native-paper';
import { ThemeType } from '../../theme/types';
import { Button } from '@components/index';
import { ButtonVariation } from '@components/Button/Button';

interface ConfirmationDialogProps {
  title: string;
  visible: boolean;
  theme: ThemeType;
  onSubmit: () => void;
  onDismiss: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  title,
  visible,
  onDismiss,
  theme,
  onSubmit,
}) => {
  const handleOnSubmit = () => {
    onSubmit();
    onDismiss();
  };

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={[styles.container, { backgroundColor: theme.colorPrimary }]}
      >
        <Dialog.Title style={[styles.title, { color: theme.textColorPrimary }]}>
          {title}
        </Dialog.Title>
        <Dialog.Actions>
          <Button
            theme={theme}
            onPress={onDismiss}
            title={getString('common.cancel')}
            variation={ButtonVariation.CLEAR}
          />
          <Button
            theme={theme}
            onPress={handleOnSubmit}
            title={getString('common.ok')}
            variation={ButtonVariation.CLEAR}
            style={styles.button}
          />
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default ConfirmationDialog;

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
  },
  title: {
    letterSpacing: 0,
    fontSize: 16,
  },
  button: {
    marginLeft: 4,
  },
});
