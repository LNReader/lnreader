import React from "react";
import { StyleSheet, View, Text, ImageBackground, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableRipple } from "react-native-paper";

import { useSelector } from "react-redux";

const NovelCover = ({ item, onPress, libraryStatus }) => {
    const displayMode = useSelector(
        (state) => state.settingsReducer.displayMode
    );

    const theme = useSelector((state) => state.themeReducer.theme);

    const itemsPerRow = useSelector(
        (state) => state.settingsReducer.itemsPerRow
    );

    const height = {
        1: 550,
        2: 280,
        3: 180,
        4: 140,
        5: 100,
        6: 80,
        7: 70,
        8: 58,
        9: 55,
        10: 50,
    };

    return displayMode !== 2 ? (
        <View style={{ flex: 1 / itemsPerRow }}>
            <TouchableRipple
                borderless
                centered
                rippleColor={theme.rippleColor}
                style={styles.opac}
                onPress={onPress}
            >
                <>
                    {item.novelCover && (
                        <ImageBackground
                            source={{ uri: item.novelCover }}
                            style={{ height: height[itemsPerRow] }}
                            imageStyle={[
                                { borderRadius: 4 },
                                libraryStatus && { opacity: 0.5 },
                            ]}
                            progressiveRenderingEnabled={true}
                        >
                            <View style={{ flexDirection: "row", margin: 4 }}>
                                {item.chaptersDownloaded && (
                                    <Text
                                        style={[
                                            {
                                                flex: 0,
                                                backgroundColor: "#47a84a",
                                                color: "#FFFFFF",
                                                borderTopLeftRadius: 4,
                                                borderBottomLeftRadius: 4,
                                                paddingTop: 2,
                                                paddingHorizontal: 4,
                                                alignSelf: "flex-start",
                                                fontSize: 12,
                                            },
                                            !item.chaptersUnread && {
                                                borderTopRightRadius: 4,
                                                borderBottomRightRadius: 4,
                                            },
                                        ]}
                                    >
                                        {item.chaptersDownloaded}
                                    </Text>
                                )}
                                {item.chaptersUnread && (
                                    <Text
                                        style={[
                                            {
                                                flex: 0,
                                                backgroundColor: "#2979FF",
                                                color: "#FFFFFF",
                                                borderTopRightRadius: 4,
                                                borderBottomRightRadius: 4,
                                                paddingTop: 2,
                                                paddingHorizontal: 4,
                                                alignSelf: "flex-start",
                                                fontSize: 12,
                                            },
                                            !item.chaptersDownloaded && {
                                                borderTopLeftRadius: 4,
                                                borderBottomLeftRadius: 4,
                                            },
                                        ]}
                                    >
                                        {item.chaptersUnread}
                                    </Text>
                                )}
                            </View>
                            {displayMode === 0 && (
                                <View style={styles.titleContainer}>
                                    <LinearGradient
                                        colors={[
                                            "transparent",
                                            "rgba(0,0,0,0.6)",
                                        ]}
                                        style={styles.linearGradient}
                                    >
                                        <Text
                                            numberOfLines={2}
                                            style={[
                                                styles.title,
                                                {
                                                    color:
                                                        "rgba(255,255,255,1)",
                                                },
                                            ]}
                                        >
                                            {item.novelName}
                                        </Text>
                                    </LinearGradient>
                                </View>
                            )}
                        </ImageBackground>
                    )}
                    {displayMode === 1 && (
                        <Text
                            numberOfLines={2}
                            style={[
                                styles.title,
                                {
                                    color: theme.textColorPrimary,
                                    padding: 4,
                                },
                            ]}
                        >
                            {item.novelName}
                        </Text>
                    )}
                </>
            </TouchableRipple>
        </View>
    ) : (
        <TouchableRipple
            borderless
            centered
            rippleColor={theme.rippleColor}
            style={styles.listView}
            onPress={onPress}
        >
            <>
                <Image
                    source={{ uri: item.novelCover }}
                    style={styles.extensionIcon}
                />
                <Text
                    style={{
                        flex: 1,
                        color: theme.textColorPrimary,
                        marginLeft: 16,
                        fontSize: 15,
                        paddingRight: 8,
                    }}
                    numberOfLines={1}
                >
                    {item.novelName}
                </Text>
            </>
        </TouchableRipple>
    );
};

export default NovelCover;

const styles = StyleSheet.create({
    // logo: {
    //     height: 180,
    // },
    titleContainer: {
        flex: 1,
        justifyContent: "flex-end",
        borderRadius: 4,
    },
    title: {
        fontFamily: "pt-sans-bold",
        fontSize: 14,
        padding: 8,
    },

    linearGradient: {
        bottom: -1,
        borderRadius: 4,
    },
    opac: {
        paddingHorizontal: 4.5,
        paddingVertical: 4,
        borderRadius: 4,
    },
    extensionIcon: {
        width: 42,
        height: 42,
        borderRadius: 4,
    },
    listView: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 4,
    },
});
