import React from 'react';

import { Button } from '@components';
import { Dialog, overlay, Portal } from 'react-native-paper';
import { ThemeColors } from '@theme/types';
import { getString } from '@strings/translations';
import { StyleSheet } from 'react-native';

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
        style={[
          {
            backgroundColor: overlay(2, theme.surface),
          },
          styles.borderRadius,
        ]}
      >
        <Dialog.Title
          style={[
            {
              color: theme.onSurface,
            },
            styles.fontSize,
          ]}
        >
          {getString('downloadScreen.removeDownloadsWarning')}
        </Dialog.Title>
        <Dialog.Actions>
          <Button onPress={hideDialog}>{getString('common.cancel')}</Button>
          <Button onPress={onSubmit}>{getString('common.ok')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default RemoveDownloadsDialog;

const styles = StyleSheet.create({
  fontSize: {
    letterSpacing: 0,
    fontSize: 16,
  },
  borderRadius: { borderRadius: 6 },
});
