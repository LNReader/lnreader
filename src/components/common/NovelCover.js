import React, { useState } from "react";
import { StyleSheet, View, Text, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableRipple } from "react-native-paper";

import { useSelector } from "react-redux";
import { color } from "react-native-reanimated";

const NovelCover = ({ item, onPress, libraryStatus }) => {
    const displayMode = useSelector(
        (state) => state.settingsReducer.displayMode
    );

    const theme = useSelector((state) => state.themeReducer.theme);

    return (
        <View style={{ flex: 1 / 3 }}>
            <TouchableRipple
                borderless
                centered
                rippleColor={theme.rippleColorDark}
                style={styles.opac}
                onPress={onPress}
            >
                <>
                    {item.novelCover ? (
                        <ImageBackground
                            source={{
                                uri: item.novelCover,
                            }}
                            style={styles.logo}
                            imageStyle={[
                                { borderRadius: 4 },
                                libraryStatus && { opacity: 0.4 },
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
                                                        theme.textColorPrimaryDark,
                                                },
                                            ]}
                                        >
                                            {item.novelName}
                                        </Text>
                                    </LinearGradient>
                                </View>
                            )}
                        </ImageBackground>
                    ) : (
                        <View>
                            <Text style={{ color: "white" }}>
                                Novel Cover Doesn't Exist
                            </Text>
                        </View>
                    )}
                    {displayMode === 1 && (
                        <Text
                            numberOfLines={2}
                            style={[
                                styles.title,
                                { color: theme.textColorPrimaryDark },
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
        height: 177,
        borderRadius: 4,
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
        borderRadius: 4,
    },
    opac: {
        paddingHorizontal: 3.5,
        paddingVertical: 3.5,
        borderRadius: 4,
    },
});
