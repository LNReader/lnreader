import { StyleSheet, TextInput, View } from 'react-native';
import React, { useState } from 'react';

import { Button, List } from '@components/index';

import { useAppDispatch, useReaderSettings } from '@redux/hooks';
import { useTheme } from '@hooks/useTheme';
import { getString } from '@strings/translations';
import { setReaderSettings } from '@redux/settings/settings.actions';
import { Portal } from 'react-native-paper';
import CustomFileModal from '../Modals/CustomFileModal';
import useBoolean from '@hooks/useBoolean';

interface CustomJSSettingsProps {
  readerSettings: ReturnType<typeof useReaderSettings>;
}

const CustomJSSettings: React.FC<CustomJSSettingsProps> = ({
  readerSettings,
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const [customJS, setCustomJS] = useState(readerSettings.customJS);
  const jsModal = useBoolean();

  return (
    <>
      <View style={styles.header}>
        <List.SubHeader theme={theme}>
          {getString('moreScreen.settingsScreen.readerSettings.customJS')}
        </List.SubHeader>
        <List.SubHeader theme={theme}>
          {readerSettings.customJS !== customJS
            ? getString('moreScreen.settingsScreen.readerSettings.notSaved')
            : null}
        </List.SubHeader>
      </View>
      <View style={styles.customJSContainer}>
        <TextInput
          style={[{ color: theme.onSurface }, styles.fontSizeL]}
          value={customJS}
          placeholderTextColor={theme.onSurfaceVariant}
          placeholder="Example: document.getElementById('example');"
          multiline={true}
          editable={false}
        />
        <View style={styles.customJSButtons}>
          <Button
            onPress={jsModal.setTrue}
            style={styles.marginLeftS}
            title={getString('common.edit')}
          />
          <Button
            onPress={() => {
              setCustomJS('');
              dispatch(setReaderSettings('customJS', ''));
            }}
            title={getString('common.clear')}
          />
        </View>
      </View>
      {/*
            Modals
        */}
      <Portal>
        <CustomFileModal
          title={getString('moreScreen.settingsScreen.readerSettings.customJS')}
          visible={jsModal.value}
          onDismiss={jsModal.setFalse}
          theme={theme}
          customFile={customJS}
          setCustomFile={setCustomJS}
          type="JS"
          openFileButtonLabel={getString(
            'moreScreen.settingsScreen.readerSettings.openJSFile',
          )}
          placeholder="Example: document.getElementById('example');"
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
