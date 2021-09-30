import React from 'react';

import {Button, Dialog, Portal} from 'react-native-paper';
import {deleteAllHistory} from '../../database/queries/HistoryQueries';
import {showToast} from '../../hooks/showToast';

const RemoveHistoryDialog = ({dialogVisible, hideDialog, theme}) => {
  const onPress = () => {
    deleteAllHistory();
    showToast('History deleted.');
    hideDialog();
  };

  return (
    <Portal>
      <Dialog
        visible={dialogVisible}
        onDismiss={hideDialog}
        style={{
          borderRadius: 6,
          backgroundColor: theme.colorPrimary,
        }}
      >
        <Dialog.Title
          style={{
            letterSpacing: 0,
            fontSize: 16,
            color: theme.textColorPrimary,
          }}
        >
          Are you sure? All history will be lost.
        </Dialog.Title>
        <Dialog.Actions>
          <Button
            uppercase={false}
            theme={{colors: {primary: theme.colorAccent}}}
            onPress={hideDialog}
            labelStyle={{letterSpacing: 0}}
          >
            Cancel
          </Button>
          <Button
            uppercase={false}
            theme={{colors: {primary: theme.colorAccent}}}
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

export default RemoveHistoryDialog;
