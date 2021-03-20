import React from "react";
import { StyleSheet, View, Text, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableRipple } from "react-native-paper";

import { useSelector } from "react-redux";

const NovelCover = ({ item, onPress, libraryStatus }) => {
    const displayMode = useSelector(
        (state) => state.settingsReducer.displayMode
    );

    const theme = useSelector((state) => state.themeReducer.theme);

    // const itemsPerRow = useSelector(
    //     (state) => state.settingsReducer.itemsPerRow
    // );

    return (
        <View style={{ flex: 1 / 3 }}>
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
                            style={styles.logo}
                            imageStyle={[
                                { borderRadius: 4 },
                                libraryStatus && { opacity: 0.5 },
                            ]}
                            progressiveRenderingEnabled={true}
                        >
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
    );
};

export default NovelCover;

const styles = StyleSheet.create({
    logo: {
        height: 180,
    },
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
});
