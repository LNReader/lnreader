import { StyleSheet, ScrollView, View } from 'react-native';
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
  const [customCSS, setcustomCSS] = useState(readerSettings.customCSS);
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
        onPressMinus={() => setHorizontalSpace(horizontalSpace - 1)}
        onPressPlus={() => setHorizontalSpace(horizontalSpace + 1)}
        min={0}
      />
      <PlusMinusField
        labelStyle={labelStyle}
        label="Max Width"
        value={maxWidth}
        onPressMinus={() => setmaxWidth(maxWidth - 50)}
        onPressPlus={() => setmaxWidth(maxWidth + 50)}
        min={100}
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
  autoScrollInterval: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customThemeButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  customCSSContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  buttons: {
    flex: 1,
  },
  customCSSButtons: {
    flex: 1,
    flexDirection: 'row-reverse',
  },
  paddingRightM: {
    flex: 1,
    paddingRight: 16,
  },
});
