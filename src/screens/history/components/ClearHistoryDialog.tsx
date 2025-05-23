import React from 'react';
import { StyleSheet } from 'react-native';
import { Dialog, Portal } from 'react-native-paper';

import { Button } from '@components';
import { getString } from '@strings/translations';
import { ThemeColors } from '@theme/types';

interface ClearHistoryDialogProps {
  visible: boolean;
  theme: ThemeColors;
  onSubmit: () => void;
  onDismiss: () => void;
}

const ClearHistoryDialog: React.FC<ClearHistoryDialogProps> = ({
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
        style={[styles.container, { backgroundColor: theme.overlay3 }]}
      >
        <Dialog.Title style={[styles.title, { color: theme.onSurface }]}>
          {getString('historyScreen.clearHistorWarning')}
        </Dialog.Title>
        <Dialog.Actions>
          <Button onPress={onDismiss}>{getString('common.cancel')}</Button>
          <Button onPress={handleOnSubmit}>{getString('common.ok')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default ClearHistoryDialog;

const styles = StyleSheet.create({
  button: {
    marginLeft: 4,
  },
  container: {
    borderRadius: 28,
    margin: 20,
  },
  title: {
    fontSize: 16,
    letterSpacing: 0,
  },
});
