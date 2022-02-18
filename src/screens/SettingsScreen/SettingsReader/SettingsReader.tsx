import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {Appbar, IconButton} from '../../../components/';
import {
  useAppDispatch,
  useReaderSettings,
  useTheme,
} from '../../../redux/hooks';
import {
  setReaderFont,
  setReaderFontSize,
  setReaderLineHeight,
  setReaderPadding,
  setReaderTheme,
} from '../../../redux/settings/settingsSlice';
import {fonts} from '../../../theme/reader/fonts';
import {presetReaderThemes} from '../../../theme/reader/presets';
import {
  ReaderFontToggleButton,
  ReaderThemeToggleButton,
} from '../../ReaderScreen/components';

const SettingsReader = () => {
  const theme = useTheme();
  const {goBack} = useNavigation();
  const dispatch = useAppDispatch();

  const {
    backgroundColor,
    textColor,
    lineHeight,
    fontFamily,
    paddingHorizontal,
    fontSize,
  } = useReaderSettings();

  return (
    <>
      <Appbar title="Reader" theme={theme} handleGoBack={goBack} />
      <View style={styles.container}>
        <Text style={{color: theme.onSurface}}>Themes</Text>
        <FlatList
          horizontal
          style={styles.themesList}
          showsHorizontalScrollIndicator={false}
          data={presetReaderThemes}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <ReaderThemeToggleButton
              readerTheme={item}
              selected={
                item.backgroundColor === backgroundColor &&
                item.textColor === textColor
              }
              onPress={() =>
                dispatch(
                  setReaderTheme({
                    backgroundColor: item.backgroundColor,
                    textColor: item.textColor,
                  }),
                )
              }
            />
          )}
        />
      </View>
      <View style={styles.container}>
        <Text style={{color: theme.onSurface}}>Fonts</Text>
        <FlatList
          horizontal
          style={styles.fontsList}
          showsHorizontalScrollIndicator={false}
          data={fonts}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <ReaderFontToggleButton
              readerFont={item}
              theme={theme}
              selected={item.fontFamily === fontFamily}
              onPress={() =>
                dispatch(
                  setReaderFont({
                    fontFamily: item.fontFamily,
                  }),
                )
              }
            />
          )}
        />
      </View>
      <View style={styles.container}>
        <Text style={{color: theme.onSurface}}>Padding</Text>
        <View style={styles.paddingContainer}>
          <IconButton
            name="minus"
            theme={theme}
            disabled={paddingHorizontal <= 0}
            onPress={() =>
              dispatch(
                setReaderPadding({
                  paddingHorizontal: paddingHorizontal - 1,
                }),
              )
            }
          />
          <Text
            style={[styles.valueText, {color: theme.onSurface}]}
          >{`${paddingHorizontal}%`}</Text>
          <IconButton
            name="plus"
            theme={theme}
            disabled={paddingHorizontal >= 10}
            onPress={() =>
              dispatch(
                setReaderPadding({
                  paddingHorizontal: paddingHorizontal + 1,
                }),
              )
            }
          />
        </View>
      </View>
      <View style={styles.container}>
        <Text style={{color: theme.onSurface}}>Font size</Text>
        <View style={styles.paddingContainer}>
          <IconButton
            name="minus"
            theme={theme}
            disabled={fontSize <= 1}
            onPress={() =>
              dispatch(
                setReaderFontSize({
                  fontSize: fontSize - 1,
                }),
              )
            }
          />
          <Text style={[styles.valueText, {color: theme.onSurface}]}>
            {fontSize}
          </Text>
          <IconButton
            name="plus"
            theme={theme}
            onPress={() =>
              dispatch(
                setReaderFontSize({
                  fontSize: fontSize + 1,
                }),
              )
            }
          />
        </View>
      </View>
      <View style={styles.container}>
        <Text style={{color: theme.onSurface}}>Line height</Text>
        <View style={styles.paddingContainer}>
          <IconButton
            name="minus"
            theme={theme}
            disabled={lineHeight <= 1.3}
            onPress={() =>
              dispatch(
                setReaderLineHeight({
                  lineHeight: lineHeight - 0.1,
                }),
              )
            }
          />
          <Text style={[styles.valueText, {color: theme.onSurface}]}>{`${
            Math.round(lineHeight * 10) / 10
          }%`}</Text>
          <IconButton
            name="plus"
            theme={theme}
            disabled={lineHeight >= 2}
            onPress={() =>
              dispatch(
                setReaderLineHeight({
                  lineHeight: lineHeight + 0.1,
                }),
              )
            }
          />
        </View>
      </View>
    </>
  );
};

export default SettingsReader;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themesList: {
    flexDirection: 'row-reverse',
  },
  fontsList: {
    marginLeft: 16,
    flexDirection: 'row',
  },
  paddingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 16,
    marginHorizontal: 16,
  },
});
