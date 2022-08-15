import React from 'react';

import { Button, Dialog, overlay, Portal } from 'react-native-paper';

const RemoveDownloadsDialog = ({
  dialogVisible,
  hideDialog,
  theme,
  onSubmit,
}) => {
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
            color: theme.textColorPrimary,
          }}
        >
          Are you sure? All downloaded chapters will be deleted.
        </Dialog.Title>
        <Dialog.Actions>
          <Button
            uppercase={false}
            theme={{ colors: { primary: theme.primary } }}
            onPress={hideDialog}
            labelStyle={{ letterSpacing: 0 }}
          >
            Cancel
          </Button>
          <Button
            uppercase={false}
            theme={{ colors: { primary: theme.primary } }}
            onPress={onSubmit}
            labelStyle={{ letterSpacing: 0 }}
          >
            Ok
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default RemoveDownloadsDialog;
