import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as WebBrowser from 'expo-web-browser';

import {useAppDispatch} from '../../../../redux/hooks';

import {NovelInfo} from '../../../../database/types';
import {ThemeType} from '../../../../theme/types';
// import {toggleFollowNovel} from '../../../../redux/novel/novelSlice';
// import {toggleFollowNovelInDb} from '../../../../database/queries/NovelQueries';

interface NovelScreenButtonGroupProps {
  novel: NovelInfo | null;
  theme: ThemeType;
}

const NovelScreenButtonGroup: React.FC<NovelScreenButtonGroupProps> = ({
  novel,
  theme,
}) => {
  const {novelId, followed, url} = novel;
  const followButtonColor = followed ? theme.primary : theme.textColorHint;

  const dispatch = useAppDispatch();

  // const handleFollowNovel = () => {
  //   toggleFollowNovelInDb(novelId, followed);
  //   dispatch(toggleFollowNovel());
  // };

  const handleOpenWebView = async () => {
    WebBrowser.openBrowserAsync(url);
  };

  return (
    <View style={styles.buttonGroupContainer}>
      <View style={styles.buttonContainer}>
        <Pressable
          android_ripple={{color: theme.rippleColor}}
          // onPress={handleFollowNovel}
          style={styles.button}
        >
          <MaterialCommunityIcons
            name={followed ? 'heart' : 'heart-outline'}
            color={followButtonColor}
            size={24}
          />
          <Text style={[styles.buttonLabel, {color: followButtonColor}]}>
            {followed ? 'In library' : 'Add to library'}
          </Text>
        </Pressable>
      </View>
      <View style={styles.buttonContainer}>
        <Pressable
          android_ripple={{color: theme.rippleColor}}
          onPress={handleOpenWebView}
          style={styles.button}
        >
          <MaterialCommunityIcons
            name="earth"
            color={theme.textColorHint}
            size={24}
          />
          <Text style={[styles.buttonLabel, {color: theme.textColorHint}]}>
            WebView
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default NovelScreenButtonGroup;

const styles = StyleSheet.create({
  buttonGroupContainer: {
    marginHorizontal: 16,
    paddingTop: 8,
    // paddingBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  buttonContainer: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 50,
    marginHorizontal: 16,
  },
  button: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    marginTop: 4,
    fontSize: 12,
  },
});
