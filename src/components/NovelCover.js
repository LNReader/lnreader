import React from "react";
import { StyleSheet, View, Text, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const NovelCover = ({ item }) => {
    return (
        <ImageBackground
            source={{
                uri: item.novelCover,
            }}
            style={styles.logo}
            imageStyle={{ borderRadius: 6 }}
        >
            <View style={styles.titleContainer}>
                <LinearGradient
                    colors={["transparent", "black"]}
                    style={styles.linearGradient}
                >
                    <Text numberOfLines={2} style={styles.title}>
                        {item.novelName}
                    </Text>
                </LinearGradient>
            </View>
        </ImageBackground>
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
        fontSize: 15,
        color: "white",
        padding: 5,
        width: "100%",
    },
    linearGradient: {
        borderRadius: 6,
    },
});
