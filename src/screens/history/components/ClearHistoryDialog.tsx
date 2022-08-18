import React from 'react';
import { StyleSheet } from 'react-native';

import { getString } from '@strings/translations';

import { Button, Dialog, Portal } from 'react-native-paper';
import { MD3ThemeType } from '../../../theme/types';

interface ClearHistoryDialogProps {
  visible: boolean;
  theme: MD3ThemeType;
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
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.container}>
        <Dialog.Title style={[styles.title, { color: theme.textColorPrimary }]}>
          {getString('historyScreen.clearHistorWarning')}
        </Dialog.Title>
        <Dialog.Actions>
          <Button theme={{ colors: { ...theme } }} onPress={onDismiss}>
            {getString('common.cancel')}
          </Button>
          <Button theme={{ colors: { ...theme } }} onPress={handleOnSubmit}>
            {getString('common.ok')}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default ClearHistoryDialog;

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
