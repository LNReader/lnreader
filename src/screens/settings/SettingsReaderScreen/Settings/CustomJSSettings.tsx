import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Portal } from 'react-native-paper';

import { Button, List, ConfirmationDialog } from '@components/index';

import useBoolean from '@hooks/useBoolean';
import { useTheme } from '@hooks/useTheme';
import { useAppDispatch, useReaderSettings } from '@redux/hooks';
import { setReaderSettings } from '@redux/settings/settings.actions';
import { getString } from '@strings/translations';

import CustomFileModal from '../Modals/CustomFileModal';

interface CustomJSSettingsProps {
  readerSettings: ReturnType<typeof useReaderSettings>;
}

const CustomJSSettings: React.FC<CustomJSSettingsProps> = ({
  readerSettings,
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const jsModal = useBoolean();
  const clearJSModal = useBoolean();

  return (
    <>
      <View style={styles.header}>
        <List.SubHeader theme={theme}>
          {getString('moreScreen.settingsScreen.readerSettings.customJS')}
        </List.SubHeader>
      </View>
      <View style={styles.customJSContainer}>
        <Text numberOfLines={3} style={[{ color: theme.onSurface }]}>
          {readerSettings.customJS || 'Example: body {margin: 10px;}'}
        </Text>
        <View style={styles.customJSButtons}>
          <Button
            onPress={jsModal.setTrue}
            style={styles.marginLeftS}
            title={getString('common.edit')}
          />
          <Button
            onPress={clearJSModal.setTrue}
            title={getString('common.clear')}
          />
        </View>
      </View>

      {/* Modals */}
      <Portal>
        <CustomFileModal
          visible={jsModal.value}
          onDismiss={jsModal.setFalse}
          defaultValue={readerSettings.customJS}
          mimeType="application/javascript"
          title={getString('moreScreen.settingsScreen.readerSettings.customJS')}
          description={getString(
            'moreScreen.settingsScreen.readerSettings.jsHint',
          )}
          placeholder="Example: document.getElementById('example');"
          openFileLabel={getString(
            'moreScreen.settingsScreen.readerSettings.openJSFile',
          )}
          onSave={text => dispatch(setReaderSettings('customJS', text))}
        />
        <ConfirmationDialog
          title={getString(
            'moreScreen.settingsScreen.readerSettings.clearCustomJS',
          )}
          visible={clearJSModal.value}
          onSubmit={() => {
            dispatch(setReaderSettings('customJS', ''));
          }}
          onDismiss={clearJSModal.setFalse}
          theme={theme}
        />
      </Portal>
    </>
  );
};
export default CustomJSSettings;

const styles = StyleSheet.create({
  fontSizeL: {
    fontSize: 16,
  },
  customJSContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  marginLeftS: {
    marginLeft: 8,
  },
  customJSButtons: {
    flex: 1,
    flexDirection: 'row-reverse',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
});
