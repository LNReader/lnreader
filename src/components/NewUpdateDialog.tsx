import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, Dimensions } from 'react-native';
import { Portal, Modal } from 'react-native-paper';
import * as Linking from 'expo-linking';

import { Button } from '@components';

import { useBoolean, useReleaseChecker, useTheme } from '@hooks';
import { getString } from '@strings/translations';

const NewUpdateDialog: React.FC = () => {
  const theme = useTheme();

  const newRelease = useReleaseChecker();

  const {
    value: isVisible,
    setFalse: hideModal,
    setValue: setModalVisible,
  } = useBoolean();

  useEffect(() => {
    setModalVisible(Boolean(newRelease));
  }, [newRelease]);

  const modalHeight = Dimensions.get('window').height / 2;

  if (!newRelease) {
    return null;
  }

  return (
    <Portal>
      <Modal
        visible={isVisible}
        onDismiss={hideModal}
        contentContainerStyle={[
          styles.containerStyle,
          { backgroundColor: theme.overlay3 },
        ]}
      >
        <Text style={[styles.modalHeader, { color: theme.onSurface }]}>
          {`${getString('common.newUpdateAvailable')} ${newRelease?.tagName}`}
        </Text>
        <ScrollView style={{ height: modalHeight }}>
          <Text style={{ color: theme.onSurface }}>
            {newRelease?.changelog}
          </Text>
        </ScrollView>
        <View style={styles.buttonCtn}>
          <Button title={getString('common.cancel')} onPress={hideModal} />
          <Button
            title={getString('common.install')}
            onPress={() => Linking.openURL(newRelease?.downloadUrl)}
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
  buttonCtn: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'flex-end',
  },
});
