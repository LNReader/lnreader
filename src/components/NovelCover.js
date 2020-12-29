import React from "react";
import { StyleSheet, View, Text, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableRipple } from "react-native-paper";
import { theme } from "../theming/theme";

const NovelCover = ({ item, onPress }) => {
    return (
        <TouchableRipple
            borderless
            centered
            rippleColor={theme.rippleColorDark}
            style={styles.opac}
            onPress={onPress}
        >
            <ImageBackground
                source={{
                    uri: item.novelCover,
                }}
                style={styles.logo}
                imageStyle={{ borderRadius: 6 }}
                progressiveRenderingEnabled={true}
            >
                <View style={styles.titleContainer}>
                    <LinearGradient
                        colors={["transparent", "rgba(0,0,0,0.6)"]}
                        style={styles.linearGradient}
                    >
                        <Text numberOfLines={2} style={styles.title}>
                            {item.novelName}
                        </Text>
                    </LinearGradient>
                </View>
            </ImageBackground>
        </TouchableRipple>
    );
};

export default NovelCover;

const styles = StyleSheet.create({
    logo: {
        height: "100%",
        borderRadius: 6,
    },
    titleContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        borderRadius: 6,
    },
    title: {
        fontFamily: "pt-sans-bold",
        fontSize: 16,
        color: "white",
        padding: 5,
        width: "100%",
    },
    linearGradient: {
        borderRadius: 6,
    },
    opac: {
        height: 190,
        flex: 1 / 3,
        marginHorizontal: 3.6,
        marginVertical: 3.2,
        borderRadius: 6,
    },
});
