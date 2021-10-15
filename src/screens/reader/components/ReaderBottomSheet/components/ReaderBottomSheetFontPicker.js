import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';

import {useDispatch} from 'react-redux';

import {setReaderSettings} from '../../../../../redux/settings/settings.actions';

import {fonts} from '../../../../../services/utils/constants';

export const ReaderBottomSheetFontPicker = ({reader, theme}) => {
  const dispatch = useDispatch();

  const isSelected = font => reader.fontFamily === font.fontFamily;

  return (
    <View style={styles.row}>
      <Text style={[{color: theme.textColorSecondary}, styles.title]}>
        Font style
      </Text>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{alignItems: 'center'}}
      >
        {fonts.map(item => (
          <View
            key={item.fontFamily}
            style={[
              styles.container,
              isSelected(item) && {backgroundColor: theme.rippleColor},
            ]}
          >
            <Pressable
              style={styles.content}
              onPress={() =>
                dispatch(setReaderSettings('fontFamily', item.fontFamily))
              }
              android_ripple={{color: theme.rippleColor}}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: item.fontFamily,
                  color: isSelected(item)
                    ? theme.colorAccent
                    : theme.textColorPrimary,
                }}
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

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 6,
  },
  content: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
  },
  title: {
    marginRight: 16,
  },
});
