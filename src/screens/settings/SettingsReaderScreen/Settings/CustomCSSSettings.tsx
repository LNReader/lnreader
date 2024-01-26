import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Portal } from 'react-native-paper';

import { Button, List, ConfirmationDialog } from '@components';

import { useBoolean } from '@hooks';
import { useTheme, useChapterReaderSettings } from '@hooks/persisted';
import { getString } from '@strings/translations';

import CustomFileModal from '../Modals/CustomFileModal';

const CustomCSSSettings = () => {
  const theme = useTheme();
  const { customCSS, setChapterReaderSettings } = useChapterReaderSettings();

  const cssModal = useBoolean();
  const clearCSSModal = useBoolean();

  const customCSSPlaceholder = 'body {margin: 10px;}';

  return (
    <>
      <View style={styles.header}>
        <List.SubHeader theme={theme}>
          {getString('readerSettings.customCSS')}
        </List.SubHeader>
      </View>
      <View style={styles.customCSSContainer}>
        <Text numberOfLines={3} style={[{ color: theme.onSurface }]}>
          {customCSS ||
            `${getString('common.example')}: ${customCSSPlaceholder}`}
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
          defaultValue={customCSS}
          mimeType="text/css"
          title={getString('readerSettings.customCSS')}
          description={getString('readerSettings.cssHint')}
          placeholder={`${getString(
            'common.example',
          )}: ${customCSSPlaceholder}`}
          openFileLabel={getString('readerSettings.openCSSFile')}
          onSave={text => setChapterReaderSettings({ customCSS: text })}
        />
        <ConfirmationDialog
          title={getString('readerSettings.clearCustomCSS')}
          visible={clearCSSModal.value}
          onSubmit={() => {
            setChapterReaderSettings({ customCSS: '' });
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
