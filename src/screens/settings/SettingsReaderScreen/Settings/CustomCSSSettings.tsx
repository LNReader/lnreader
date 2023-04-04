import { StyleSheet, ScrollView, View, TextInput } from 'react-native';
import React, { useState } from 'react';

import { Button, List } from '@components/index';

import { setReaderSettings } from '@redux/settings/settings.actions';

import PlusMinusField from '@components/PlusMinusField/PlusMinusField';
import { useTheme } from '@hooks/useTheme';
import { useAppDispatch, useReaderSettings } from '@redux/hooks';
import { getString } from '@strings/translations';

const CustomCSSSettings = () => {
  const theme = useTheme();
  const readerSettings = useReaderSettings();
  const [customCSS, setCustomCSS] = useState(readerSettings.customCSS);
  const dispatch = useAppDispatch();

  const [horizontalSpace, setHorizontalSpace] = useState(0);
  const [maxWidth, setmaxWidth] = useState(100);

  const labelStyle = [styles.fontSizeL, { color: theme.onSurface }];

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.bottomInset}>
      <List.SubHeader theme={theme}>Spacing</List.SubHeader>
      <PlusMinusField
        labelStyle={labelStyle}
        label="Horizontal Spacing"
        value={horizontalSpace}
        method={val => setHorizontalSpace(val)}
        min={0}
      />
      <PlusMinusField
        labelStyle={labelStyle}
        label="Max Width"
        value={maxWidth}
        method={val => setmaxWidth(val)}
        valueChange={50}
        min={100}
      />
      <TextInput
        style={[
          { color: theme.onSurface },
          styles.fontSizeL,
          styles.customCSSContainer,
        ]}
        value={customCSS}
        onChangeText={text => setCustomCSS(text)}
        placeholderTextColor={theme.onSurfaceVariant}
        placeholder="Example: document.getElementById('example');"
        multiline={true}
      />
      <View style={styles.customCSSButtons}>
        <Button
          onPress={() => dispatch(setReaderSettings('customCSS', customCSS))}
          style={styles.buttons}
          title={getString('common.save')}
        />
        <Button
          onPress={() => {
            setcustomCSS('');
            dispatch(setReaderSettings('customCSS', ''));
          }}
          style={styles.buttons}
          title={getString('common.clear')}
        />
      </View>
    </ScrollView>
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
  customCSSButtons: {
    flex: 1,
    flexDirection: 'row-reverse',
  },
});
