import { ScrollView, StyleSheet, Text, TextStyle, View } from 'react-native';
import React from 'react';
import { setReaderSettings } from '../../../../redux/settings/settings.actions';
import {
  useAppDispatch,
  useReaderSettings,
  useSettingsV2,
} from '../../../../redux/hooks';
import { ToggleColorButton } from '../../../../components/Common/ToggleButton';
import { getString } from '../../../../../strings/translations';
import { presetReaderThemes } from '../../../../utils/constants/readerConstants';
import { useTheme } from '@hooks/useTheme';

interface ReaderThemeSelectorProps {
  label?: string;
  labelStyle?: TextStyle | TextStyle[];
}

const ReaderThemeSelector: React.FC<ReaderThemeSelectorProps> = ({
  label,
  labelStyle,
}) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const {
    reader: { customThemes = [] },
  } = useSettingsV2();

  const { theme: backgroundColor, textColor } = useReaderSettings();

  return (
    <View style={styles.container}>
      <Text
        style={[{ color: theme.onSurfaceVariant }, styles.title, labelStyle]}
      >
        {label || getString('readerScreen.bottomSheet.color')}
      </Text>
      <ScrollView
        horizontal={true}
        contentContainerStyle={styles.scrollView}
        showsHorizontalScrollIndicator={false}
      >
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
  scrollView: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
});
