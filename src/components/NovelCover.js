import React, { useState } from "react";
import { StyleSheet, View, Text, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableRipple } from "react-native-paper";
import { theme } from "../theme/theme";

import AsyncStorage from "@react-native-async-storage/async-storage";

const NovelCover = ({ item, onPress, libraryStatus }) => {
    const [mode, setMode] = useState();
    AsyncStorage.getItem("@display_mode").then((value) => setMode(value));

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
                                { borderRadius: 6 },
                                libraryStatus && { opacity: 0.4 },
                            ]}
                            progressiveRenderingEnabled={true}
                        >
                            {(!mode || mode === "compact") && (
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
                                            style={styles.title}
                                        >
                                            {item.novelName}
                                        </Text>
                                    </LinearGradient>
                                </View>
                            )}
                        </ImageBackground>
                    ) : (
                        <View>
                            <Text style={{ color: "white" }}>HAHAHAHAH</Text>
                        </View>
                    )}
                    {mode === "comfortable" && (
                        <Text numberOfLines={2} style={styles.title}>
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
        height: 186,
        borderRadius: 6,
    },
    titleContainer: {
        flex: 1,
        justifyContent: "flex-end",
        borderRadius: 6,
    },
    title: {
        fontFamily: "pt-sans-bold",
        fontSize: 14,
        color: "white",
        padding: 8,
        textShadowColor: "rgba(0, 0, 0, 0.75)",
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    linearGradient: {
        borderRadius: 6,
    },
    opac: {
        paddingHorizontal: 4,
        paddingVertical: 4,
        borderRadius: 6,
    },
});
