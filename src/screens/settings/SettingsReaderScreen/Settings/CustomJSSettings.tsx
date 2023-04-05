import { StyleSheet, TextInput, View } from 'react-native';
import React, { useState } from 'react';

import { Button, List } from '@components/index';

import { useAppDispatch, readerSettingType } from '@redux/hooks';
import { useTheme } from '@hooks/useTheme';
import { getString } from '@strings/translations';
import { setReaderSettings } from '@redux/settings/settings.actions';

interface CustomJSSettingsProps {
  readerSettings: readerSettingType;
}

const CustomJSSettings: React.FC<CustomJSSettingsProps> = ({
  readerSettings,
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const [customJS, setCustomJS] = useState(readerSettings.customJS);

  return (
    <>
      <List.SubHeader theme={theme}>
        {getString('moreScreen.settingsScreen.readerSettings.customJS')}
      </List.SubHeader>
      <View style={styles.customCSSContainer}>
        <TextInput
          style={[{ color: theme.onSurface }, styles.fontSizeL]}
          value={customJS}
          onChangeText={text => setCustomJS(text)}
          placeholderTextColor={theme.onSurfaceVariant}
          placeholder="Example: document.getElementById('example');"
          multiline={true}
        />
        <View style={styles.customCSSButtons}>
          <Button
            onPress={() => dispatch(setReaderSettings('customJS', customJS))}
            style={styles.marginLeftS}
            title={getString('common.save')}
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
    </>
  );
};
export default CustomJSSettings;

const styles = StyleSheet.create({
  fontSizeL: {
    fontSize: 16,
  },
  customCSSContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  marginLeftS: {
    marginLeft: 8,
  },
  customCSSButtons: {
    flex: 1,
    flexDirection: 'row-reverse',
  },
});
