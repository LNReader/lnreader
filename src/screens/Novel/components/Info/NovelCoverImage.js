import React from "react";
import { View, ImageBackground, StyleSheet } from "react-native";

import { LinearGradient } from "expo-linear-gradient";

const NovelCoverImage = ({ children, source, theme }) => {
    return (
        <ImageBackground source={source} style={styles.background}>
            <LinearGradient
                colors={["rgba(0,0,0,0.2)", theme.colorPrimaryDark]}
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
