import React from 'react';
import { StyleSheet, View } from 'react-native';

import { getString } from '@strings/translations';

import { Dialog, Portal } from 'react-native-paper';
import { ThemeColors } from '../../theme/types';
import { Button } from '@components/index';

interface ConfirmationDialogProps {
  title: string;
  visible: boolean;
  theme: ThemeColors;
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
        style={[styles.container, { backgroundColor: theme.overlay3 }]}
      >
        <Dialog.Title style={[styles.title, { color: theme.onSurface }]}>
          {title}
        </Dialog.Title>
        <View style={styles.buttonCtn}>
          <Button onPress={handleOnSubmit} title={getString('common.ok')} />
          <Button onPress={onDismiss} title={getString('common.cancel')} />
        </View>
      </Dialog>
    </Portal>
  );
};

export default ConfirmationDialog;

const styles = StyleSheet.create({
  container: {
    borderRadius: 28,
  },
  title: {
    letterSpacing: 0,
    fontSize: 16,
  },
  buttonCtn: {
    flexDirection: 'row-reverse',
    padding: 16,
  },
});
