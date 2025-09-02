import React from 'react';
import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { ThemePicker } from '@components/ThemePicker/ThemePicker';
import { ThemeColors } from '@theme/types';
import { useMMKVObject } from 'react-native-mmkv';
import { useTheme } from '@providers/Providers';
import { darkThemes, lightThemes } from '@theme/md3';
import { getString } from '@strings/translations';

const ThemeList = ({
  theme,
  list,
}: {
  theme: ThemeColors;
  list: ThemeColors[];
}) => {
  const [, setTheme] = useMMKVObject('APP_THEME');
  return (
    <FlatList
      contentContainerStyle={styles.flatListContainer}
      data={list}
      renderItem={({ item }) => (
        <ThemePicker
          key={item.id}
          currentTheme={theme}
          theme={item}
          onPress={() => {
            setTheme(item);
          }}
        />
      )}
      horizontal={false}
      numColumns={3}
    />
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
          {isDarkButton
            ? getString('onboardingScreen.dark')
            : getString('onboardingScreen.light')}
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
    <View style={styles.flex}>
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
    paddingBottom: 16,
  },
  darkButton: {
    borderBottomRightRadius: 24,
    borderRightWidth: 1,
    borderTopRightRadius: 24,
  },
  lightButton: {
    borderBottomLeftRadius: 24,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopLeftRadius: 24,
  },
  schemeButton: {
    paddingHorizontal: 36,
    paddingVertical: 8,
  },
  schemeButtonWrapper: {
    borderBottomWidth: 1,
    borderTopWidth: 1,
  },
  flatListContainer: {
    margin: 'auto',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  flex: { flex: 1 },
});
