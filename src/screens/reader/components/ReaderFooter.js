import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isUrlAbsolute } from '../../../utils/isAbsoluteUrl';
import FadeView from '../../../components/Common/CrossFadeView';
import * as WebBrowser from 'expo-web-browser';
import color from 'color';

const ChapterFooter = ({
  hide,
  theme,
  chapterUrl,
  nextChapter,
  prevChapter,
  useWebViewForChapter,
  readerSheetRef,
  scrollViewRef,
  navigateToNextChapter,
  navigateToPrevChapter,
  openDrawer,
}) => {
  const rippleConfig = {
    color: theme.rippleColor,
    borderless: true,
    radius: 50,
  };

  const insets = useSafeAreaInsets();

  return (
    <FadeView style={styles.footer} active={hide} animationDuration={150}>
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
          onPress={navigateToPrevChapter}
        >
          <IconButton
            icon="chevron-left"
            size={26}
            disabled={!prevChapter}
            iconColor={theme.onSurface}
          />
        </Pressable>
        {isUrlAbsolute(chapterUrl) ? (
          <Pressable
            android_ripple={rippleConfig}
            style={styles.buttonStyles}
            onPress={() => WebBrowser.openBrowserAsync(chapterUrl)}
          >
            <IconButton icon="earth" size={26} iconColor={theme.onSurface} />
          </Pressable>
        ) : null}
        {!useWebViewForChapter && (
          <>
            <Pressable
              android_ripple={rippleConfig}
              style={styles.buttonStyles}
              onPress={() => scrollViewRef.current.scrollTo({})}
            >
              <IconButton
                icon="format-vertical-align-top"
                size={26}
                iconColor={theme.onSurface}
              />
            </Pressable>
          </>
        )}
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
          onPress={() => readerSheetRef.current.snapToIndex(1)}
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
          onPress={navigateToNextChapter}
        >
          <IconButton
            icon="chevron-right"
            size={26}
            disabled={!nextChapter}
            iconColor={theme.onSurface}
          />
        </Pressable>
      </View>
    </FadeView>
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
