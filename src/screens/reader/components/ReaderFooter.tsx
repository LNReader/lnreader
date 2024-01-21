import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import color from 'color';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { ThemeColors } from '@theme/types';
import { ChapterInfo } from '@database/types';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';

interface ChapterFooterProps {
  theme: ThemeColors;
  chapterUrl: string;
  nextChapter: ChapterInfo;
  prevChapter: ChapterInfo;
  readerSheetRef: React.RefObject<BottomSheetModalMethods>;
  scrollTo: (offsetY: number) => void;
  navigateToChapterBySwipe: (actionName: string) => void;
  openDrawer: () => void;
}

const ChapterFooter = ({
  theme,
  chapterUrl,
  nextChapter,
  prevChapter,
  readerSheetRef,
  scrollTo,
  navigateToChapterBySwipe,
  openDrawer,
}: ChapterFooterProps) => {
  const rippleConfig = {
    color: theme.rippleColor,
    borderless: true,
    radius: 50,
  };

  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(150)}
      style={styles.footer}
    >
      <View
        style={[
          {
            backgroundColor: color(theme.surface).alpha(0.9).string(),
            paddingBottom: insets.bottom,
          },
          styles.buttonsContainer,
        ]}
      >
        <Pressable
          android_ripple={rippleConfig}
          style={styles.buttonStyles}
          onPress={() => navigateToChapterBySwipe('SWIPE_RIGHT')}
        >
          <IconButton
            icon="chevron-left"
            size={26}
            disabled={!prevChapter}
            iconColor={theme.onSurface}
          />
        </Pressable>
        <Pressable
          android_ripple={rippleConfig}
          style={styles.buttonStyles}
          onPress={() => WebBrowser.openBrowserAsync(chapterUrl)}
        >
          <IconButton icon="earth" size={26} iconColor={theme.onSurface} />
        </Pressable>
        <Pressable
          android_ripple={rippleConfig}
          style={styles.buttonStyles}
          onPress={() => scrollTo(0)}
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
          onPress={() => navigateToChapterBySwipe('SWIPE_LEFT')}
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingBottom: 4,
  },
  footer: {
    position: 'absolute',
    zIndex: 2,
    bottom: 0,
    width: '100%',
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
});
