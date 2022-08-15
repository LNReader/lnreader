import React from 'react';
import { StyleSheet } from 'react-native';

import { getString } from '@strings/translations';

import { Dialog, Portal } from 'react-native-paper';
import { MD3ThemeType } from '../../../theme/types';
import { Button } from '@components/index';
import { ButtonVariation } from '@components/Button/Button';

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
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={[styles.container, { backgroundColor: theme.surface }]}
      >
        <Dialog.Title style={[styles.title, { color: theme.textColorPrimary }]}>
          {getString('historyScreen.clearHistorWarning')}
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
