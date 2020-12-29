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
import NovelCover from "../../../components/NovelCover";
import { theme } from "../../../theming/theme";

const SearchScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [novels, setNovels] = useState([]);
    const [searchText, setSearchText] = useState("");

    const getNovels = (searchText) => {
        setLoading(true);
        fetch(
            `https://lnreader-extensions.herokuapp.com/api/2/search/?s=${searchText}`
        )
            .then((response) => response.json())
            .then((json) => setNovels(json))
            .catch((error) => console.error(error))
            .finally(() => setLoading(false));
    };
    return (
        <>
            <Appbar.Header style={{ backgroundColor: theme.colorDarkPrimary }}>
                <Appbar.BackAction
                    onPress={() => {
                        navigation.goBack();
                        setSearchText("");
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
                        <ActivityIndicator
                            size="large"
                            color={theme.colorAccentDark}
                        />
                    </View>
                ) : (
                    <>
                        {!novels.length ? (
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Text
                                    style={{
                                        color: theme.textColorSecondaryDark,
                                        fontSize: 40,
                                        fontWeight: "bold",
                                    }}
                                >
                                    Σ(ಠ_ಠ)
                                </Text>
                                <Text
                                    style={{
                                        color: theme.textColorSecondaryDark,
                                        fontWeight: "bold",
                                        marginTop: 10,
                                    }}
                                >
                                    Try searching a light novel
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                contentContainerStyle={styles.list}
                                numColumns={3}
                                data={novels}
                                showsVerticalScrollIndicator={false}
                                keyExtractor={(item) => item.novelUrl}
                                renderItem={({ item }) => (
                                    <NovelCover
                                        item={item}
                                        onPress={() =>
                                            navigation.navigate(
                                                "NovelItem",
                                                item
                                            )
                                        }
                                    />
                                )}
                            />
                        )}
                    </>
                )}
            </View>
        </>
    );
};

export default SearchScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: "#202125",
        backgroundColor: "#000000",
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
});
