import React, { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Button, Modal, Portal, Switch, TextInput } from "react-native-paper";
import { setNovel } from "../../../redux/novel/novel.actions";
import { updateNovelInfo } from "../../../database/queries/NovelQueries";

const EditInfoModal = ({ theme, hideModal, modalVisible, novel, dispatch }) => {
    const [info, setInfo] = useState(novel);

    const [tag, setTag] = useState("");

    const textInputTheme = {
        colors: {
            primary: theme.colorAccent,
            placeholder: theme.textColorHint,
            text: theme.textColorPrimary,
            background: theme.colorPrimary,
        },
    };

    const removeTag = (tag) => {
        let tags = info.genre.split(",").filter((item) => item !== tag);
        setInfo({ ...info, genre: tags.join(",") });
    };

    return (
        <Portal>
            <Modal
                visible={modalVisible}
                onDismiss={hideModal}
                contentContainerStyle={[
                    styles.modalContainer,
                    { backgroundColor: theme.colorPrimary },
                ]}
            >
                <Text
                    style={[
                        styles.modalTitle,
                        { color: theme.textColorPrimary },
                    ]}
                >
                    Edit info
                </Text>
                <TextInput
                    placeholder={`Title: ${info.novelName}`}
                    style={{ fontSize: 14 }}
                    numberOfLines={1}
                    mode="outlined"
                    theme={textInputTheme}
                    onChangeText={(text) =>
                        setInfo({ ...info, novelName: text })
                    }
                    dense
                />
                <TextInput
                    placeholder={`Author: ${info.author}`}
                    style={{ fontSize: 14 }}
                    numberOfLines={1}
                    mode="outlined"
                    theme={textInputTheme}
                    onChangeText={(text) => setInfo({ ...info, author: text })}
                    dense
                />
                <TextInput
                    placeholder={`Description: ${info.novelSummary.substring(
                        0,
                        16
                    )}...`}
                    style={{ fontSize: 14 }}
                    numberOfLines={1}
                    mode="outlined"
                    onChangeText={(text) =>
                        setInfo({ ...info, novelSummary: text })
                    }
                    theme={textInputTheme}
                    dense
                />

                <TextInput
                    placeholder={`Add Tag`}
                    style={{ fontSize: 14 }}
                    numberOfLines={1}
                    mode="outlined"
                    onChangeText={(text) => setTag(text)}
                    onSubmitEditing={() => {
                        setInfo({ ...info, genre: info.genre + "," + tag });
                        setTag("");
                    }}
                    theme={textInputTheme}
                    dense
                />

                {info.genre !== null && info.genre !== "" && (
                    <FlatList
                        contentContainerStyle={{ marginVertical: 8 }}
                        horizontal
                        data={info.genre.split(",")}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <GenreChip
                                theme={theme}
                                onPress={() => removeTag(item)}
                            >
                                {item}
                            </GenreChip>
                        )}
                        showsHorizontalScrollIndicator={false}
                    />
                )}
                <View style={{ flexDirection: "row-reverse" }}>
                    <Button
                        labelStyle={{
                            color: theme.colorAccent,
                            letterSpacing: 0,
                            textTransform: "none",
                        }}
                        theme={{ colors: { primary: theme.colorAccent } }}
                        onPress={() => {
                            updateNovelInfo(info, novel.novelId);
                            hideModal();
                            dispatch(setNovel({ ...novel, ...info }));
                        }}
                    >
                        Save
                    </Button>
                    <Button
                        labelStyle={{
                            color: theme.colorAccent,
                            letterSpacing: 0,
                            textTransform: "none",
                        }}
                        theme={{ colors: { primary: theme.colorAccent } }}
                        onPress={hideModal}
                    >
                        Cancel
                    </Button>
                </View>
            </Modal>
        </Portal>
    );
};

export default EditInfoModal;

const GenreChip = ({ children, theme, onPress }) => (
    <View
        style={{
            flex: 1,
            flexDirection: "row",
            borderWidth: 1,
            borderRadius: 50,
            borderColor: theme.colorAccent,
            paddingVertical: 2,
            paddingHorizontal: 8,
            marginVertical: 4,
            marginRight: 8,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.colorPrimary,
        }}
    >
        <Text style={{ color: theme.colorAccent, textTransform: "capitalize" }}>
            {children}
        </Text>
        <MaterialCommunityIcons
            name="close-circle"
            color={theme.colorAccent}
            size={16}
            onPress={onPress}
            style={{ marginLeft: 4 }}
        />
    </View>
);

const styles = StyleSheet.create({
    modalContainer: {
        margin: 30,
        padding: 20,
        borderRadius: 8,
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 16,
    },
    errorText: {
        color: "#FF0033",
        paddingTop: 8,
    },
    genreChip: {},
});
