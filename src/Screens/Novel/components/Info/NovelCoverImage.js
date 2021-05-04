import React from "react";
import { ImageBackground, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import easeGradient from "react-native-easing-gradient";

const NovelCoverImage = ({ children, source, theme }) => {
    const { colors, locations } = easeGradient({
        colorStops: {
            0: {
                color: "rgba(0,0,0,0.2)",
            },
            1: {
                color: theme.colorPrimaryDark,
            },
        },
    });

    return (
        <ImageBackground source={source} style={styles.background}>
            <LinearGradient
                colors={colors}
                locations={locations}
                style={styles.linearGradient}
            >
                {children}
            </LinearGradient>
        </ImageBackground>
    );
};

export default NovelCoverImage;

const styles = StyleSheet.create({
    background: { height: 285 },
    linearGradient: { height: 286 },
});
