import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ThemePicker } from '@components/ThemePicker/ThemePicker';
import { ThemeColors } from '@theme/types';
import { ScrollView } from 'react-native-gesture-handler';
import { useMMKVObject } from 'react-native-mmkv';
import { useTheme } from '@hooks/persisted';
import { darkThemes, lightThemes } from '@theme/md3';

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

const SchemeButton = ({
  onPress,
  isDarkButton = false,
}: {
  onPress: () => void;
  isDarkButton?: boolean;
}) => {
  const theme = useTheme();
  const isSelected =
    (theme.isDark && isDarkButton) || (!theme.isDark && !isDarkButton);
  return (
    <View
      style={[
        styles.schemeButtonWrapper,
        isDarkButton ? styles.darkButton : styles.lightButton,
        {
          borderColor: theme.onSurface,
          backgroundColor: isSelected ? theme.primary : theme.surface,
        },
      ]}
    >
      <Pressable
        android_ripple={{ color: theme.rippleColor, borderless: true }}
        style={styles.schemeButton}
        onPress={onPress}
      >
        <Text style={{ color: isSelected ? theme.onPrimary : theme.onSurface }}>
          {isDarkButton ? 'Dark' : 'Light'}
        </Text>
      </Pressable>
    </View>
  );
};

const getInverseTheme = (theme: ThemeColors) => {
  let index = (theme.isDark ? darkThemes : lightThemes).findIndex(
    item => item.id === theme.id,
  );
  if (index === -1) {
    index = 1;
  }
  if (theme.isDark) {
    return lightThemes[index];
  }
  return darkThemes[index];
};

export default function PickThemeStep() {
  const theme = useTheme();
  const [, setTheme] = useMMKVObject('APP_THEME');
  return (
    <View>
      <View style={styles.buttonContainer}>
        <SchemeButton
          onPress={() => {
            if (theme.isDark) {
              setTheme(getInverseTheme(theme));
            }
          }}
        />
        <SchemeButton
          onPress={() => {
            if (!theme.isDark) {
              setTheme(getInverseTheme(theme));
            }
          }}
          isDarkButton={true}
        />
      </View>
      <ThemeList theme={theme} list={theme.isDark ? darkThemes : lightThemes} />
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 24,
  },
  schemeButtonWrapper: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  schemeButton: {
    paddingVertical: 8,
    paddingHorizontal: 36,
  },
  lightButton: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
  },
  darkButton: {
    borderRightWidth: 1,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },
});
