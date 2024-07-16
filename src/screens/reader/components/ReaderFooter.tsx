import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import color from 'color';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { ThemeColors } from '@theme/types';
import { ChapterInfo } from '@database/types';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { ChapterScreenProps } from '@navigators/types';
import { useDeviceOrientation } from '@hooks/index';
import { useChapterContext } from '../ChapterContext';

interface ChapterFooterProps {
  theme: ThemeColors;
  nextChapter: ChapterInfo;
  prevChapter: ChapterInfo;
  readerSheetRef: React.RefObject<BottomSheetModalMethods>;
  scrollToStart: () => void;
  navigateToChapterBySwipe: (actionName: string) => void;
  navigation: ChapterScreenProps['navigation'];
  openDrawer: () => void;
}

const ChapterFooter = ({
  theme,
  nextChapter,
  prevChapter,
  readerSheetRef,
  scrollToStart,
  navigateToChapterBySwipe,
  navigation,
  openDrawer,
}: ChapterFooterProps) => {
  const { novel, chapter } = useChapterContext();
  const rippleConfig = {
    color: theme.rippleColor,
    borderless: true,
    radius: 50,
  };
  const orientation = useDeviceOrientation();
  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(150)}
      style={[
        styles.footer,
        {
          backgroundColor: color(theme.surface).alpha(0.9).string(),
          paddingBottom: orientation === 'potrait' ? 40 : 0,
        },
      ]}
    >
      <View style={[styles.buttonsContainer]}>
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
    flex: 1,
    position: 'absolute',
    zIndex: 1,
    bottom: 0,
    width: '100%',
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
});
