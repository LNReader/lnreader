import { StyleSheet, View, TextInput } from 'react-native';
import React, { useState } from 'react';

import { Button, List } from '@components/index';

import { setReaderSettings } from '@redux/settings/settings.actions';

import { useTheme } from '@hooks/useTheme';
import { useAppDispatch, useReaderSettings } from '@redux/hooks';
import { getString } from '@strings/translations';
import CustomCSSModal from '../Modals/CustomCSSModal';
import useBoolean from '@hooks/useBoolean';
import { Portal } from 'react-native-paper';

const CustomCSSSettings = () => {
  const theme = useTheme();
  const readerSettings = useReaderSettings();
  const [customCSS, setCustomCSS] = useState(readerSettings.customCSS);
  const dispatch = useAppDispatch();
  const cssModal = useBoolean();

  return (
    <>
      <List.SubHeader theme={theme}>
        {getString('moreScreen.settingsScreen.readerSettings.customCSS')}
      </List.SubHeader>
      <View style={styles.customCSSContainer}>
        <TextInput
          style={[{ color: theme.onSurface }, styles.fontSizeL]}
          value={customCSS}
          onChangeText={text => setCustomCSS(text)}
          placeholderTextColor={theme.onSurfaceVariant}
          placeholder="Example: body {margin: 10px;}"
          multiline={true}
          editable={false}
        />
        <View style={styles.customCSSButtons}>
          <Button
            onPress={cssModal.setTrue}
            style={styles.marginLeftS}
            title={getString('common.edit')}
          />
          <Button
            onPress={() => {
              setCustomCSS('');
              dispatch(setReaderSettings('customCSS', ''));
            }}
            title={getString('common.clear')}
          />
        </View>
      </View>
      {/*
            Modals
        */}
      <Portal>
        <CustomCSSModal
          title={getString(
            'moreScreen.settingsScreen.readerSettings.customCSS',
          )}
          visible={cssModal.value}
          onDismiss={cssModal.setFalse}
          theme={theme}
          customCSS={customCSS}
          setCustomCSS={setCustomCSS}
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
});
