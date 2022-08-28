import React from 'react';
import { StyleSheet, View } from 'react-native';

import { getString } from '@strings/translations';

import { Dialog, Portal } from 'react-native-paper';
import { MD3ThemeType } from '../../theme/types';
import { Button } from '@components/index';
import { ButtonVariation } from '@components/Button/Button';
import { getDialogBackground } from '@theme/colors';

interface ConfirmationDialogProps {
  title: string;
  visible: boolean;
  theme: MD3ThemeType;
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
        style={[
          styles.container,
          { backgroundColor: getDialogBackground(theme) },
        ]}
      >
        <Dialog.Title style={[styles.title, { color: theme.textColorPrimary }]}>
          {title}
        </Dialog.Title>
        <View style={styles.buttonCtn}>
          <Button
            theme={theme}
            onPress={handleOnSubmit}
            title={getString('common.ok')}
            variation={ButtonVariation.CLEAR}
          />
          <Button
            theme={theme}
            onPress={onDismiss}
            title={getString('common.cancel')}
            variation={ButtonVariation.CLEAR}
          />
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
