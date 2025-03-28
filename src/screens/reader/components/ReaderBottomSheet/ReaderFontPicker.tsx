import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import color from 'color';

import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import { getString } from '@strings/translations';
import { useChapterReaderSettings, useTheme } from '@hooks/persisted';

import { Font, readerFonts } from '@utils/constants/readerConstants';
import { FlatList } from 'react-native-gesture-handler';

interface FontChipProps {
  item: Font;
}

const ReaderFontPicker = () => {
  const theme = useTheme();
  const { fontFamily, setChapterReaderSettings } = useChapterReaderSettings();

  const isSelected = useCallback(
    (item: Font) => item.fontFamily === fontFamily,
    [fontFamily],
  );

  const FontChipItem = useCallback(
    ({ item }: FontChipProps) => {
      return (
        <View
          key={item.fontFamily}
          style={[
            styles.container,
            {
              backgroundColor: theme.surfaceVariant,
            },
          ]}
        >
          <Pressable
            style={styles.content}
            onPress={() =>
              setChapterReaderSettings({ fontFamily: item.fontFamily })
            }
            android_ripple={{
              color: color(theme.primary).alpha(0.12).string(),
            }}
          >
            {isSelected(item) ? (
              <MaterialCommunityIcons
                name="check"
                color={theme.primary}
                size={16}
              />
            ) : null}
            <Text
              style={[
                styles.label,
                {
                  fontFamily: item.fontFamily,
                  color: isSelected(item) ? theme.primary : theme.onSurface,
                },
                isSelected(item) && styles.mLeft,
              ]}
            >
              {item.name}
            </Text>
          </Pressable>
        </View>
      );
    },
    [
      isSelected,
      setChapterReaderSettings,
      theme.onSurface,
      theme.primary,
      theme.surfaceVariant,
    ],
  );

  return (
    <View style={styles.row}>
      <Text style={[{ color: theme.onSurfaceVariant }, styles.title]}>
        {getString('readerScreen.bottomSheet.fontStyle')}
      </Text>
      <FlatList
        data={readerFonts}
        renderItem={FontChipItem}
        keyExtractor={(item, index) => 'font' + index}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

export default React.memo(ReaderFontPicker);
const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    marginHorizontal: 6,
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 32,
    paddingHorizontal: 10,
    paddingVertical: 1,
  },
  label: {
    fontSize: 16,
  },
  mLeft: {
    marginLeft: 4,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  title: {
    marginRight: 16,
  },
});
