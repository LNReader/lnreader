import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    View,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { TouchableRipple } from "react-native-paper";
import NovelCover from "../components/NovelCover";
import { theme } from "../theming/theme";

const LatestScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(true);
    const [novels, setNovels] = useState();

    const getNovels = () => {
        fetch("http://192.168.1.42:5000/api/latest")
            .then((response) => response.json())
            .then((json) => setNovels(json))
            .catch((error) => console.error(error))
            .finally(() => {
                setRefreshing(false);
                setLoading(false);
            });
    };

    useEffect(() => {
        getNovels();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        getNovels();
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={{ flex: 1, justifyContent: "center" }}>
                    <ActivityIndicator
                        size="large"
                        color={theme.colorAccentDark}
                    />
                </View>
            ) : (
                <FlatList
                    contentContainerStyle={styles.list}
                    numColumns={3}
                    data={novels}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item.novelUrl}
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
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["white"]}
                            progressBackgroundColor={theme.colorAccentDark}
                        />
                    }
                />
            )}
        </View>
    );
};

export default LatestScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: "#202125",
        backgroundColor: "#000000",
    },
    opac: {
        height: 190,
        flex: 1 / 3,
        marginHorizontal: 3.6,
        marginVertical: 3.2,
    },
});
