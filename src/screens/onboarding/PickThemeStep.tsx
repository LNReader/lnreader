import React from 'react';
import { View, Text } from 'react-native';
import {
  defaultTheme,
  midnightDusk,
  tealTurquoise,
  yotsubaTheme,
  lavenderTheme,
  strawberryDaiquiriTheme,
  takoTheme,
} from '@theme/md3';
import { ThemePicker } from '@components/ThemePicker/ThemePicker';
import { ThemeColors } from '@theme/types';
import { ScrollView } from 'react-native-gesture-handler';
import { useMMKVObject } from 'react-native-mmkv';
import { useTheme } from '@hooks/persisted';
const lightThemes = [
  defaultTheme.light,
  midnightDusk.light,
  tealTurquoise.light,
  yotsubaTheme.light,
  lavenderTheme.light,
  strawberryDaiquiriTheme.light,
  takoTheme.light,
];
// const darkThemes = [
//     defaultTheme.dark,
//     midnightDusk.dark,
//     tealTurquoise.dark,
//     yotsubaTheme.dark,
//     lavenderTheme.dark,
//     strawberryDaiquiriTheme.dark,
//     takoTheme.dark,
// ];

const ThemeList = ({
  theme,
  list,
}: {
  theme: ThemeColors;
  list: ThemeColors[];
}) => {
  const [, setTheme] = useMMKVObject('APP_THEME');
  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: 'row',
      }}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
    >
      {list.map(item => (
        <ThemePicker
          key={item.id}
          currentTheme={theme}
          theme={item}
          onPress={() => {
            setTheme(item);
          }}
        />
      ))}
    </ScrollView>
  );
};

export default function PickThemeStep() {
  const theme = useTheme();
  return (
    <View>
      <View style={{ flexDirection: 'row' }}>
        <Text>Light</Text>
        <Text>Dark</Text>
      </View>
      <ThemeList theme={theme} list={lightThemes} />
    </View>
  );
}
