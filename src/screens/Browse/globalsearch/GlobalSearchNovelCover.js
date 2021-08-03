import React from "react";
import { StyleSheet, View, Text, Image, Pressable } from "react-native";

const GlobalSearchNovelCover = ({
    novel,
    theme,
    onPress,
    inLibrary,
    onLongPress,
}) => {
    const { novelName, novelCover } = novel;

    return (
        <View style={{ flex: 1, borderRadius: 6, overflow: "hidden" }}>
            <Pressable
                android_ripple={{ color: theme.rippleColor }}
                style={styles.novelContainer}
                onPress={onPress}
                onLongPress={onLongPress}
            >
                <>
                    <Image
                        source={{
                            uri:
                                novelCover && !novelCover.startsWith("/")
                                    ? novelCover
                                    : "https://github.com/LNReader/lnreader-sources/blob/main/src/coverNotAvailable.jpg?raw=true",
                        }}
                        style={[
                            styles.novelCover,
                            inLibrary && { opacity: 0.5 },
                        ]}
                        progressiveRenderingEnabled={true}
                    />
                    <Text
                        numberOfLines={2}
                        style={[
                            styles.title,
                            { color: theme.textColorPrimary },
                        ]}
                    >
                        {novelName}
                    </Text>
                </>
            </Pressable>
        </View>
    );
};

export default GlobalSearchNovelCover;

const styles = StyleSheet.create({
    novelContainer: {
        paddingHorizontal: 5,
        paddingVertical: 4,
        borderRadius: 4,
    },
    novelCover: {
        height: 150,
        width: 115,
        borderRadius: 4,
    },
    title: {
        fontFamily: "pt-sans-bold",
        fontSize: 14,
        padding: 4,
        flexWrap: "wrap",
        width: 115,
    },
});
