import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getString } from '../../../../../strings/translations';
import {
  useAppDispatch,
  useReaderSettings,
  useTheme,
} from '../../../../redux/hooks';

import { setReaderSettings } from '../../../../redux/settings/settings.actions';
import { Font, readerFonts } from '../../../../utils/constants/readerConstants';

const ReaderFontPicker = () => {
  const dispatch = useAppDispatch();

  const theme = useTheme();
  const { fontFamily } = useReaderSettings();

  const isSelected = (font: Font) => fontFamily === font.fontFamily;

  return (
    <View style={styles.row}>
      <Text style={[{ color: theme.textColorSecondary }, styles.title]}>
        {getString('readerScreen.bottomSheet.fontStyle')}
      </Text>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {readerFonts.map(item => (
          <View
            key={item.fontFamily}
            style={[styles.container, { backgroundColor: theme.rippleColor }]}
          >
            <Pressable
              style={styles.content}
              onPress={() =>
                dispatch(setReaderSettings('fontFamily', item.fontFamily))
              }
              android_ripple={{ color: theme.rippleColor }}
            >
              {isSelected(item) ? (
                <MaterialCommunityIcons
                  name="check"
                  color={theme.colorAccent}
                  size={16}
                />
              ) : null}
              <Text
                style={[
                  styles.label,
                  {
                    fontFamily: item.fontFamily,
                    color: isSelected(item)
                      ? theme.colorAccent
                      : theme.textColorPrimary,
                    marginLeft: isSelected(item) ? 4 : 0,
                  },
                ]}
              >
                {item.name}
              </Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default ReaderFontPicker;

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
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
  scrollContainer: {
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
  },
});
