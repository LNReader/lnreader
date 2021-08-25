import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { IconButton } from "react-native-paper";
import FadeView from "../../../components/Common/CrossFadeView";

const ChapterFooter = ({
    hide,
    theme,
    swipeGestures,
    readerSheetRef,
    scrollViewRef,
    navigateToNextChapter,
    navigateToPrevChapter,
    nextChapter,
    prevChapter,
    useWebViewForChapter,
    enableSwipeGestures,
    enableWebView,
}) => {
    const rippleConfig = {
        color: theme.rippleColor,
        borderless: true,
        radius: 50,
    };

    return (
        <FadeView
            style={{
                position: "absolute",
                zIndex: 2,
                bottom: 0,
                width: "100%",
            }}
            active={hide}
            animationDuration={150}
        >
            <View
                style={{
                    backgroundColor: `${theme.colorPrimary}E6`,
                    flexDirection: "row",
                }}
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
                        color={theme.textColorPrimary}
                    />
                </Pressable>
                <Pressable
                    android_ripple={rippleConfig}
                    style={styles.buttonStyles}
                    onPress={enableSwipeGestures}
                >
                    <IconButton
                        icon="gesture-swipe"
                        disabled={!swipeGestures}
                        size={26}
                        color={theme.textColorPrimary}
                    />
                </Pressable>
                {!useWebViewForChapter && (
                    <Pressable
                        android_ripple={rippleConfig}
                        style={styles.buttonStyles}
                        onPress={() => scrollViewRef.current.scrollTo({})}
                    >
                        <IconButton
                            icon="format-vertical-align-top"
                            size={26}
                            color={theme.textColorPrimary}
                        />
                    </Pressable>
                )}
                {/* <Pressable
                    android_ripple={rippleConfig}
                    style={styles.buttonStyles}
                    onPress={enableWebView}
                >
                    <IconButton
                        icon="language-html5"
                        disabled={!useWebViewForChapter}
                        size={26}
                        color={theme.textColorPrimary}
                    />
                </Pressable> */}
                <Pressable
                    android_ripple={rippleConfig}
                    style={styles.buttonStyles}
                    onPress={() => readerSheetRef.current.show(390)}
                >
                    <IconButton
                        icon="cog-outline"
                        size={26}
                        color={theme.textColorPrimary}
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
                        color={theme.textColorPrimary}
                    />
                </Pressable>
            </View>
        </FadeView>
    );
};

export default ChapterFooter;

const styles = StyleSheet.create({
    buttonStyles: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 8,
    },
});
