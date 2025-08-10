import React, { useState } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { Portal } from 'react-native-paper';
import * as Linking from 'expo-linking';
import { ScrollView } from 'react-native-gesture-handler';
import Button from './Button/Button';
import { getString } from '@strings/translations';

import { useTheme } from '@providers/ThemeProvider';
import { Modal } from '@components';

interface NewUpdateDialogProps {
  newVersion: {
    tag_name: string;
    body: string;
    downloadUrl: string;
  };
}

const NewUpdateDialog: React.FC<NewUpdateDialogProps> = ({ newVersion }) => {
  const [newUpdateDialog, showNewUpdateDialog] = useState(true);

  const theme = useTheme();

  const modalHeight = Dimensions.get('window').height / 2;

  return (
    <Portal>
      <Modal
        visible={newUpdateDialog}
        onDismiss={() => showNewUpdateDialog(false)}
      >
        <Text style={[styles.modalHeader, { color: theme.onSurface }]}>
          {`${getString('common.newUpdateAvailable')} ${newVersion.tag_name}`}
        </Text>
        <ScrollView style={{ height: modalHeight }}>
          <Text style={[styles.body, { color: theme.onSurfaceVariant }]}>
            {newVersion.body.split('\n').join('\n\n')}
          </Text>
        </ScrollView>
        <View style={styles.buttonCtn}>
          <Button
            title={getString('common.cancel')}
            onPress={() => showNewUpdateDialog(false)}
          />
          <Button
            title={getString('common.install')}
            onPress={() => Linking.openURL(newVersion.downloadUrl)}
          />
        </View>
      </Modal>
    </Portal>
  );
};

export default NewUpdateDialog;

const styles = StyleSheet.create({
  body: {
    fontSize: 15,
    fontWeight: '500',
  },
  buttonCtn: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
