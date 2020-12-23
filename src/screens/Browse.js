import React, { useEffect, useState } from "react";
import { StyleSheet, View, FlatList, ActivityIndicator } from "react-native";
import { TouchableRipple } from "react-native-paper";
import NovelCover from "../components/NovelCover";

const BrowseScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [novels, setNovels] = useState();

    useEffect(() => {
        fetch("http://192.168.1.38:5000/api/latest")
            .then((response) => response.json())
            .then((json) => setNovels(json))
            .catch((error) => console.error(error))
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={{ flex: 1, justifyContent: "center" }}>
                    <ActivityIndicator size="large" color="white" />
                </View>
            ) : (
                <FlatList
                    contentContainerStyle={styles.list}
                    numColumns={3}
                    data={novels}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableRipple
                            borderless
                            centered
                            rippleColor="rgba(256,256,256,0.3)"
                            style={styles.opac}
                            onPress={() =>
                                navigation.navigate("NovelItem", item)
                            }
                        >
                            <NovelCover item={item} />
                        </TouchableRipple>
                    )}
                />
            )}
        </View>
    );
};

export default BrowseScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#202125",
    },
    opac: {
        height: 190,
        flex: 1 / 3,
        margin: 3.2,
    },
});
