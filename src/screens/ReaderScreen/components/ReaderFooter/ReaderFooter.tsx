import React, {useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {openBrowserAsync} from 'expo-web-browser';

import {CrossFadeView} from '../../../../components';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {ThemeType} from '../../../../theme/types';
import {ChapterItem} from '../../../../database/types';
import {useAppDispatch} from '../../../../redux/hooks';
import {updateChapterBookmarked} from '../../../../redux/novel/novelSlice';
import {updateChapterBookmarkedInDb} from '../../../../database/queries/ChapterQueries';
import {isAbsoluteUrl} from '../../utils/isAbsoluteUrl';

interface ReaderFooterProps {
  visible: boolean;
  chapterId: number;
  chapterUrl: string;
  isBookmarked: number;
  nextChapter?: ChapterItem;
  previousChapter?: ChapterItem;
  navigateToNextChapter: () => void;
  navigateToPrevChapter: () => void;
  expandBottomSheet: () => void;
  theme: ThemeType;
}

const ReaderFooter: React.FC<ReaderFooterProps> = ({
  visible,
  chapterId,
  chapterUrl,
  isBookmarked,
  nextChapter,
  navigateToNextChapter,
  previousChapter,
  navigateToPrevChapter,
  expandBottomSheet,
  theme,
}) => {
  const rippleConfig = {
    color: theme.rippleColor,
    borderless: true,
    radius: 50,
  };

  const [bookmarked, setBookmarked] = useState(isBookmarked);

  const {bottom} = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const handleOpenWebView = () => {
    openBrowserAsync(chapterUrl);
  };

  const handleBookmarkChapter = () => {
    setBookmarked(+!bookmarked);
    dispatch(updateChapterBookmarked(chapterId));
    updateChapterBookmarkedInDb(+!isBookmarked, chapterId);
  };

  return (
    <CrossFadeView
      style={styles.footerContainer}
      active={!visible}
      animationDuration={144}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: `${theme.background}E6`,
            paddingBottom: bottom,
          },
        ]}
      >
        <Pressable
          android_ripple={rippleConfig}
          style={styles.button}
          onPress={navigateToPrevChapter}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={26}
            disabled={!previousChapter}
            color={theme.textColorPrimary}
          />
        </Pressable>
        {isAbsoluteUrl(chapterUrl) ? (
          <Pressable
            android_ripple={rippleConfig}
            style={styles.button}
            onPress={handleOpenWebView}
          >
            <MaterialCommunityIcons
              name="earth"
              size={26}
              color={theme.textColorPrimary}
            />
          </Pressable>
        ) : null}
        <Pressable
          android_ripple={rippleConfig}
          style={styles.button}
          onPress={handleBookmarkChapter}
        >
          <MaterialCommunityIcons
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={26}
            disabled={!previousChapter}
            color={theme.textColorPrimary}
          />
        </Pressable>
        <Pressable
          android_ripple={rippleConfig}
          style={styles.button}
          onPress={expandBottomSheet}
        >
          <MaterialCommunityIcons
            name="cog-outline"
            size={26}
            color={theme.textColorPrimary}
          />
        </Pressable>
        <Pressable
          android_ripple={rippleConfig}
          style={styles.button}
          onPress={navigateToNextChapter}
        >
          <MaterialCommunityIcons
            name="chevron-right"
            size={26}
            disabled={!nextChapter}
            color={theme.textColorPrimary}
          />
        </Pressable>
      </View>
    </CrossFadeView>
  );
};

export default ReaderFooter;

const styles = StyleSheet.create({
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    zIndex: 1,
  },
  container: {
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
  },
});
