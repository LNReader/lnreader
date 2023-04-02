import React, { useState } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { Portal, Modal } from 'react-native-paper';
import * as Linking from 'expo-linking';
import { ScrollView } from 'react-native-gesture-handler';
import Button from './Button/Button';
import { getString } from '@strings/translations';

import { useTheme } from '@hooks/useTheme';

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
        contentContainerStyle={[
          styles.containerStyle,
          { backgroundColor: theme.overlay3 },
        ]}
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
  containerStyle: {
    padding: 20,
    margin: 20,
    borderRadius: 6,
  },
  modalHeader: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 16,
  },
  body: {
    fontSize: 15,
    fontWeight: '500',
  },
  buttonCtn: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'flex-end',
  },
});
