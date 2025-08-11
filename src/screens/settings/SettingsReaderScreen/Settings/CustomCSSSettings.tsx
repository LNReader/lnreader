import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Portal } from 'react-native-paper';

import { Button, List, ConfirmationDialog } from '@components';

import { useBoolean } from '@hooks';
import { useChapterReaderSettings } from '@hooks/persisted';
import { useTheme } from '@providers/Providers';
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
        <Text numberOfLines={3} style={{ color: theme.onSurface }}>
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
  bottomInset: {
    paddingBottom: 40,
  },
  buttons: {
    flex: 1,
  },
  customCSSButtons: {
    flex: 1,
    flexDirection: 'row-reverse',
    marginVertical: 8,
  },
  customCSSContainer: {
    marginBottom: 8,
    marginHorizontal: 16,
  },
  customThemeButton: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  flex: {
    flex: 1,
  },
  fontSizeL: {
    fontSize: 16,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  marginLeftS: {
    marginLeft: 8,
  },
});
