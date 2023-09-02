import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Portal } from 'react-native-paper';

import { Button, List, ConfirmationDialog } from '@components/index';

import useBoolean from '@hooks/useBoolean';
import { useTheme } from '@hooks/useTheme';
import { useAppDispatch, useReaderSettings } from '@redux/hooks';
import { setReaderSettings } from '@redux/settings/settings.actions';
import { getString } from '@strings/translations';

import CustomFileModal from '../Modals/CustomFileModal';

const CustomCSSSettings = () => {
  const theme = useTheme();
  const readerSettings = useReaderSettings();
  const dispatch = useAppDispatch();

  const cssModal = useBoolean();
  const clearCSSModal = useBoolean();

  return (
    <>
      <View style={styles.header}>
        <List.SubHeader theme={theme}>
          {getString('moreScreen.settingsScreen.readerSettings.customCSS')}
        </List.SubHeader>
      </View>
      <View style={styles.customCSSContainer}>
        <Text numberOfLines={3} style={[{ color: theme.onSurface }]}>
          {readerSettings.customCSS || 'Example: body {margin: 10px;}'}
        </Text>
        <View style={styles.customCSSButtons}>
          <Button
            onPress={cssModal.setTrue}
            style={styles.marginLeftS}
            title={getString('common.edit')}
          />
          <Button
            onPress={clearCSSModal.setTrue}
            title={getString('common.clear')}
          />
        </View>
      </View>

      {/* Modals */}
      <Portal>
        <CustomFileModal
          visible={cssModal.value}
          onDismiss={cssModal.setFalse}
          defaultValue={readerSettings.customCSS}
          mimeType="text/css"
          title={getString(
            'moreScreen.settingsScreen.readerSettings.customCSS',
          )}
          description={getString(
            'moreScreen.settingsScreen.readerSettings.cssHint',
          )}
          placeholder="Example: body {margin: 10px;}"
          openFileLabel={getString(
            'moreScreen.settingsScreen.readerSettings.openCSSFile',
          )}
          onSave={text => dispatch(setReaderSettings('customCSS', text))}
        />
        <ConfirmationDialog
          title={getString(
            'moreScreen.settingsScreen.readerSettings.clearCustomCSS',
          )}
          visible={clearCSSModal.value}
          onSubmit={() => {
            dispatch(setReaderSettings('customCSS', ''));
          }}
          onDismiss={clearCSSModal.setFalse}
          theme={theme}
        />
      </Portal>
    </>
  );
};
export default CustomCSSSettings;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  bottomInset: {
    paddingBottom: 40,
  },
  fontSizeL: {
    fontSize: 16,
  },
  customCSSContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  buttons: {
    flex: 1,
  },
  marginLeftS: {
    marginLeft: 8,
  },
  customCSSButtons: {
    marginVertical: 8,
    flex: 1,
    flexDirection: 'row-reverse',
  },
  customThemeButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
});
