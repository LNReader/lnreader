import { ScrollView, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { presetReaderThemes } from '../../../../theme/reader/presets';
import { setReaderSettings } from '../../../../redux/settings/settings.actions';
import {
  useAppDispatch,
  useReaderSettings,
  useTheme,
} from '../../../../redux/hooks';
import { ToggleColorButton } from '../../../../components/Common/ToggleButton';
import { getString } from '../../../../../strings/translations';

const ReaderThemeSelector = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const { theme: backgroundColor, textColor } = useReaderSettings();

  return (
    <View style={styles.container}>
      <Text style={{ color: theme.textColorSecondary }}>
        {getString('readerScreen.bottomSheet.color')}
      </Text>
      <View style={styles.selectContainer}>
        <ScrollView horizontal={true}>
          {presetReaderThemes.map((item, index) => (
            <ToggleColorButton
              key={index}
              selected={
                backgroundColor === item.backgroundColor &&
                textColor === item.textColor
              }
              backgroundColor={item.backgroundColor}
              textColor={item.textColor}
              onPress={() => {
                dispatch(setReaderSettings('theme', item.backgroundColor));
                dispatch(setReaderSettings('textColor', item.textColor));
              }}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default ReaderThemeSelector;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  selectContainer: {
    marginLeft: 16,
  },
});
