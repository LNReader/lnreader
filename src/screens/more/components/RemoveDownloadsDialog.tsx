import React from 'react';

import { Button } from '@components';
import { Dialog, overlay, Portal } from 'react-native-paper';
import { ThemeColors } from '@theme/types';

interface RemoveDownloadsDialogProps {
  dialogVisible: boolean;
  hideDialog: () => void;
  theme: ThemeColors;
  onSubmit: () => void;
}

const RemoveDownloadsDialog = ({
  dialogVisible,
  hideDialog,
  theme,
  onSubmit,
}: RemoveDownloadsDialogProps) => {
  return (
    <Portal>
      <Dialog
        visible={dialogVisible}
        onDismiss={hideDialog}
        style={{
          borderRadius: 6,
          backgroundColor: overlay(2, theme.surface),
        }}
      >
        <Dialog.Title
          style={{
            letterSpacing: 0,
            fontSize: 16,
            color: theme.onSurface,
          }}
        >
          Are you sure? All downloaded chapters will be deleted.
        </Dialog.Title>
        <Dialog.Actions>
          <Button onPress={hideDialog}>Cancel</Button>
          <Button onPress={onSubmit}>Ok</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default RemoveDownloadsDialog;
