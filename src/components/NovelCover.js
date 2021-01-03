import React from "react";
import { StyleSheet, View, Text, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableRipple } from "react-native-paper";
import { theme } from "../theming/theme";

const NovelCover = ({ item, onPress, mode, libraryStatus }) => {
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
                    <ImageBackground
                        source={{
                            uri: item.novelCover,
                        }}
                        style={styles.logo}
                        imageStyle={[
                            { borderRadius: 6 },
                            libraryStatus && { opacity: 0.5 },
                        ]}
                        progressiveRenderingEnabled={true}
                    >
                        {(!mode || mode === "compact") && (
                            <View style={styles.titleContainer}>
                                <LinearGradient
                                    colors={["transparent", "rgba(0,0,0,0.6)"]}
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
        height: 190,
        borderRadius: 6,
    },
    titleContainer: {
        flex: 1,
        justifyContent: "flex-end",
        width: "100%",
        borderRadius: 6,
    },
    title: {
        fontFamily: "pt-sans-bold",
        fontSize: 15,
        color: "white",
        padding: 5,
        width: "100%",
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
