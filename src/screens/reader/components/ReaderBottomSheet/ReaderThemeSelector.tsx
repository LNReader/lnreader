import { StyleSheet, Text, TextStyle, View } from 'react-native';
import React, { useCallback, useMemo } from 'react';
import { ToggleColorButton } from '@components/Common/ToggleButton';
import { getString } from '@strings/translations';
import { presetReaderThemes } from '@utils/constants/readerConstants';
import { useTheme } from '@hooks/persisted';
import { FlatList } from 'react-native-gesture-handler';
import { ReaderTheme } from '@screens/settings/constants/defaultValues';
import { useSettingsContext } from '@components/Context/SettingsContext';

interface ReaderThemeSelectorProps {
  label?: string;
  labelStyle?: TextStyle | TextStyle[];
}

const ReaderThemeSelector: React.FC<ReaderThemeSelectorProps> = ({
  label,
  labelStyle,
}) => {
  const theme = useTheme();

  const {
    backgroundColor,
    textColor,
    customThemes,
    setSettings: setChapterReaderSettings,
  } = useSettingsContext();

  const [listWidth, setListWidth] = React.useState(0);

  const data = [...customThemes, ...presetReaderThemes] as ReaderTheme[];
  const spacing = useMemo(
    () => ({ width: listWidth - 56 * data.length }),
    [data.length, listWidth],
  );

  const Spacer = useCallback(() => <View style={spacing} />, [spacing]);

  return (
    <View style={styles.container}>
      <Text
        style={[{ color: theme.onSurfaceVariant }, styles.title, labelStyle]}
      >
        {label || getString('readerScreen.bottomSheet.color')}
      </Text>
      <FlatList
        data={data}
        renderItem={({ item, index }) => (
          <ToggleColorButton
            key={index}
            selected={
              backgroundColor === item.backgroundColor &&
              textColor === item.textColor
            }
            backgroundColor={item.backgroundColor}
            textColor={item.textColor}
            onPress={() =>
              setChapterReaderSettings({
                backgroundColor: item.backgroundColor,
                textColor: item.textColor,
              })
            }
          />
        )}
        keyExtractor={(item, index) => item.textColor + '_' + index}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        onLayout={e => setListWidth(e.nativeEvent.layout.width)}
        ListHeaderComponent={Spacer}
      />
    </View>
  );
};

export default ReaderThemeSelector;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  title: {
    marginRight: 16,
  },
});
