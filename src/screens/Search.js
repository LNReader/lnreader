import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    FlatList,
    ActivityIndicator,
} from "react-native";
import { Appbar, TouchableRipple } from "react-native-paper";
import NovelCover from "../components/NovelCover";

const SearchScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [novels, setNovels] = useState([]);
    const [searchText, setSearchText] = useState("");

    const getNovels = (searchText) => {
        setLoading(true);
        fetch(`http://192.168.1.38:5000/api/search/?s=${searchText}&?o=rating`)
            .then((response) => response.json())
            .then((json) => setNovels(json))
            .catch((error) => console.error(error))
            .finally(() => setLoading(false));
    };
    return (
        <>
            <Appbar.Header style={{ backgroundColor: "#202125" }}>
                <Appbar.BackAction
                    onPress={() => {
                        navigation.goBack();
                        setNovels([]);
                    }}
                    color={"white"}
                    size={26}
                />
                <TextInput
                    placeholder="Search Light Novels..."
                    defaultValue={searchText}
                    style={{ fontSize: 17, flex: 1, color: "white" }}
                    placeholderTextColor="#e0e0e0"
                    blurOnSubmit={true}
                    onChangeText={(text) => {
                        setSearchText(text);
                    }}
                    onSubmitEditing={() => {
                        getNovels(searchText);
                    }}
                />
                {searchText !== "" && (
                    <Appbar.Action
                        icon="close"
                        onPress={() => {
                            setSearchText("");
                        }}
                        color={"white"}
                    />
                )}
            </Appbar.Header>
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
                    />
                )}
            </View>
        </>
    );
};

export default SearchScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#202125",
    },
    textInput: {
        alignItems: "center",
        backgroundColor: "#E6E8E9",
        borderRadius: 10,
        color: "#8E8E93",
        flexDirection: "row",
        fontSize: 17,
        height: 43,
        margin: 8,
        marginVertical: 10,
        paddingHorizontal: 10,
    },
    opac: {
        height: 190,
        flex: 1 / 3,
        margin: 3.2,
    },
});
