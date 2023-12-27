import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import color from 'color';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getString } from '../../../../../strings/translations';
import { useAppDispatch, useReaderSettings } from '../../../../redux/hooks';
import { useTheme } from '@hooks/useTheme';

import { setReaderSettings } from '@redux/settings/settingsSliceV1';
import { Font, readerFonts } from '../../../../utils/constants/readerConstants';
import { FlatList } from 'react-native-gesture-handler';

const ReaderFontPicker = () => {
  const dispatch = useAppDispatch();

  const theme = useTheme();
  const { fontFamily } = useReaderSettings();

  const isSelected = (font: Font) => fontFamily === font.fontFamily;

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
  interface FontChipProps {
    item: Font;
  }

  function FontChipItem({ item }: FontChipProps) {
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
            dispatch(
              setReaderSettings({ key: 'fontFamily', value: item.fontFamily }),
            )
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
  }
};

export default ReaderFontPicker;
const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 6,
  },
  content: {
    flexGrow: 1,
    flexDirection: 'row',
    paddingVertical: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
    minHeight: 32,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  title: {
    marginRight: 16,
  },
  label: {
    fontSize: 16,
  },
  mLeft: {
    marginLeft: 4,
  },
});
