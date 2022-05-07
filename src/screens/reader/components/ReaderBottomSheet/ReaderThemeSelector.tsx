import { ScrollView, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { presetReaderThemes } from '../../../../theme/reader/presets';
import { setReaderSettings } from '../../../../redux/settings/settings.actions';
import {
  useAppDispatch,
  useReaderSettings,
  useSettingsV2,
  useTheme,
} from '../../../../redux/hooks';
import { ToggleColorButton } from '../../../../components/Common/ToggleButton';
import { getString } from '../../../../../strings/translations';

const ReaderThemeSelector = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const {
    reader: { customThemes = [] },
  } = useSettingsV2();

  const { theme: backgroundColor, textColor } = useReaderSettings();

  return (
    <View style={styles.container}>
      <Text style={[{ color: theme.textColorSecondary }, styles.title]}>
        {getString('readerScreen.bottomSheet.color')}
      </Text>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        {[...customThemes, ...presetReaderThemes].map((item, index) => (
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
  title: {
    marginRight: 16,
  },
});
