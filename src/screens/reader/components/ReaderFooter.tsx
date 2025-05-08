import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import color from 'color';
import Animated, {
  Easing,
  ReduceMotion,
  withTiming,
} from 'react-native-reanimated';
import { ThemeColors } from '@theme/types';
import { ChapterInfo } from '@database/types';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { ChapterScreenProps } from '@navigators/types';
import { useChapterContext } from '../ChapterContext';
import { SCREEN_HEIGHT } from '@gorhom/bottom-sheet';
import { useNovelContext } from '@screens/novel/NovelContext';

interface ChapterFooterProps {
  theme: ThemeColors;
  nextChapter: ChapterInfo;
  prevChapter: ChapterInfo;
  readerSheetRef: React.RefObject<BottomSheetModalMethods | null>;
  scrollToStart: () => void;
  navigateChapter(position: 'NEXT' | 'PREV'): void;
  navigation: ChapterScreenProps['navigation'];
  openDrawer: () => void;
}

const fastOutSlowIn = Easing.bezier(0.4, 0.0, 0.2, 1.0);

const ChapterFooter = ({
  theme,
  nextChapter,
  prevChapter,
  readerSheetRef,
  scrollToStart,
  navigateChapter,
  navigation,
  openDrawer,
}: ChapterFooterProps) => {
  const { novel, chapter } = useChapterContext();
  const rippleConfig = {
    color: theme.rippleColor,
    borderless: true,
    radius: 50,
  };
  const { navigationBarHeight } = useNovelContext();

  const entering = () => {
    'worklet';
    const animations = {
      originY: withTiming(SCREEN_HEIGHT - navigationBarHeight - 64, {
        duration: 250,
        easing: fastOutSlowIn,
        reduceMotion: ReduceMotion.System,
      }),
      opacity: withTiming(1, { duration: 150 }),
    };
    const initialValues = {
      originY: SCREEN_HEIGHT - 64,
      opacity: 0,
    };
    return {
      initialValues,
      animations,
    };
  };
  const exiting = () => {
    'worklet';
    const animations = {
      originY: withTiming(SCREEN_HEIGHT - 64, {
        duration: 250,
        easing: fastOutSlowIn,
        reduceMotion: ReduceMotion.System,
      }),
      opacity: withTiming(0, { duration: 150 }),
    };
    const initialValues = {
      originY: SCREEN_HEIGHT - navigationBarHeight - 64,
      opacity: 1,
    };
    return {
      initialValues,
      animations,
    };
  };

  const style = useMemo(
    () => [
      styles.footer,
      {
        backgroundColor: color(theme.surface).alpha(0.9).string(),
        paddingBottom: navigationBarHeight,
      },
    ],
    [theme.surface, navigationBarHeight],
  );

  return (
    <Animated.View
      entering={entering}
      exiting={exiting}
      style={[styles.footer, style]}
    >
      <View style={styles.buttonsContainer}>
        <Pressable
          android_ripple={rippleConfig}
          style={styles.buttonStyles}
          onPress={() => navigateChapter('PREV')}
        >
          <IconButton
            icon="chevron-left"
            size={26}
            disabled={!prevChapter}
            iconColor={theme.onSurface}
          />
        </Pressable>
        {!novel.isLocal ? (
          <Pressable
            android_ripple={rippleConfig}
            style={styles.buttonStyles}
            onPress={() =>
              navigation.navigate('WebviewScreen', {
                name: novel.name,
                url: chapter.path,
                pluginId: novel.pluginId,
              })
            }
          >
            <IconButton icon="earth" size={26} iconColor={theme.onSurface} />
          </Pressable>
        ) : null}
        <Pressable
          android_ripple={rippleConfig}
          style={styles.buttonStyles}
          onPress={() => scrollToStart()}
        >
          <IconButton
            icon="format-vertical-align-top"
            size={26}
            iconColor={theme.onSurface}
          />
        </Pressable>
        <Pressable
          android_ripple={rippleConfig}
          style={styles.buttonStyles}
          onPress={() => openDrawer()}
        >
          <IconButton
            icon="format-horizontal-align-right"
            size={26}
            iconColor={theme.onSurface}
          />
        </Pressable>
        <Pressable
          android_ripple={rippleConfig}
          style={styles.buttonStyles}
          onPress={() => readerSheetRef.current?.present()}
        >
          <IconButton
            icon="cog-outline"
            size={26}
            iconColor={theme.onSurface}
          />
        </Pressable>
        <Pressable
          android_ripple={rippleConfig}
          style={styles.buttonStyles}
          onPress={() => navigateChapter('NEXT')}
        >
          <IconButton
            icon="chevron-right"
            size={26}
            disabled={!nextChapter}
            iconColor={theme.onSurface}
          />
        </Pressable>
      </View>
    </Animated.View>
  );
};

export default React.memo(ChapterFooter);

const styles = StyleSheet.create({
  buttonStyles: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 4,
    paddingVertical: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  footer: {
    bottom: 0,
    flex: 1,
    position: 'absolute',
    width: '100%',
    zIndex: 1,
  },
});
