import React, { useState } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { Portal, Modal } from 'react-native-paper';
import * as Linking from 'expo-linking';
import { ScrollView } from 'react-native-gesture-handler';
import Button, { ButtonVariation } from './Button/Button';
import { getString } from '@strings/translations';
import Markdown from 'react-native-markdown-display';
import { dividerColor, getDialogBackground } from '@theme/colors';
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
          { backgroundColor: getDialogBackground(theme) },
        ]}
      >
        <Text style={[styles.modalHeader, { color: theme.textColorPrimary }]}>
          {`${getString('common.newUpdateAvailable')} ${newVersion.tag_name}`}
        </Text>
        <ScrollView style={{ height: modalHeight }}>
          <Markdown
            style={{
              body: {
                color: theme.textColorSecondary,
                lineHeight: 20,
                paddingVertical: 8,
              },
              hr: {
                backgroundColor: dividerColor(theme.isDark),
                marginVertical: 16,
              },
              code_inline: {
                backgroundColor: getDialogBackground(theme),
              },
            }}
          >
            {newVersion.body}
          </Markdown>
        </ScrollView>
        <View style={styles.buttonCtn}>
          <Button
            title={getString('common.cancel')}
            theme={theme}
            variation={ButtonVariation.CLEAR}
            onPress={() => showNewUpdateDialog(false)}
          />
          <Button
            title={getString('common.install')}
            theme={theme}
            variation={ButtonVariation.CLEAR}
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
  body: {},
  buttonCtn: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'flex-end',
  },
});
