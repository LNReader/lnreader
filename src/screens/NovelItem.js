import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    View,
    Image,
    ActivityIndicator,
    ImageBackground,
} from "react-native";
import { Appbar } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";

const NovelItem = ({ route, navigation }) => {
    const item = route.params;

    const [loading, setLoading] = useState(true);
    const [novel, setNovel] = useState();

    useEffect(() => {
        fetch("http://192.168.1.38:5000/api/" + item.novelUrl)
            .then((response) => response.json())
            .then((json) => setNovel(json))
            .catch((error) => console.error(error))
            .finally(() => {
                setLoading(false);
            });
    }, []);
    return (
        <>
            <Appbar.Header style={{ backgroundColor: "#242529" }}>
                <Appbar.BackAction
                    onPress={() => {
                        navigation.goBack();
                    }}
                    color={"white"}
                    size={26}
                    style={{ marginRight: 0 }}
                />
                <Appbar.Content
                    title={item.novelName}
                    titleStyle={{ color: "white" }}
                />
            </Appbar.Header>
            <View style={styles.container}>
                {loading ? (
                    <View style={{ flex: 1, justifyContent: "center" }}>
                        <ActivityIndicator size="large" color="white" />
                    </View>
                ) : (
                    <>
                        <ImageBackground
                            source={{
                                uri: item.novelCover,
                            }}
                            style={styles.background}
                        >
                            <LinearGradient
                                colors={["transparent", "#202125"]}
                                style={styles.linearGradient}
                            >
                                <View style={styles.detailsContainer}>
                                    <Image
                                        source={{
                                            uri: item.novelCover,
                                        }}
                                        style={styles.logo}
                                    />
                                </View>
                            </LinearGradient>
                        </ImageBackground>
                    </>
                )}
            </View>
        </>
    );
};

export default NovelItem;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#202125",
    },
    background: {
        height: 240,
    },
    linearGradient: {
        height: "100%",
        backgroundColor: "rgba(256, 256, 256, 0.5)",
    },
    detailsContainer: {
        flex: 1,
        flexDirection: "row",
        margin: 17,
    },
    logo: {
        height: 180,
        width: 120,
        margin: 3.2,
        borderRadius: 6,
    },
});
