import React, {ReactNode, useState} from 'react';
import {Button, Dialog, Portal} from 'react-native-paper';

interface ModalHook {
  modalContent: ReactNode;
}

const useModalHook = ({modalContent}) => {
  const [visible, setVisible] = useState(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  return (
    <Dialog
      visible={clearDatabaseDialog}
      onDismiss={hideClearDatabaseDialog}
      style={{
        borderRadius: 6,
        backgroundColor: theme.colorPrimary,
      }}
    ></Dialog>
  );
};

export default useModalHook;
