import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Modal, Portal, Switch, TextInput } from "react-native-paper";

const JumpToChapterModal = ({
    theme,
    hideModal,
    modalVisible,
    chapters,
    navigation,
    novel,
}) => {
    const [mode, setMode] = useState(0);

    const [text, setText] = useState();
    const [error, setError] = useState();

    const onDismiss = () => {
        hideModal();
        setText();
        setError();
    };

    const onSubmit = () => {
        if (!mode) {
            if (text > 0 && text <= chapters.length) {
                navigation.navigate("Chapter", {
                    sourceId: novel.sourceId,
                    novelUrl: novel.novelUrl,
                    novelId: novel.novelId,
                    chapterId: chapters[text - 1].chapterId,
                    chapterUrl: chapters[text - 1].chapterUrl,
                    chapterName: chapters[text - 1].chapterName,
                    novelName: novel.novelName,
                    bookmark: chapters[text - 1].bookmark,
                });
                hideModal();
            } else {
                setError(
                    `Enter a valid chapter number (<= ${chapters.length})`
                );
            }
        } else {
            const chapter = chapters.find((chap) =>
                chap.chapterName.toLowerCase().includes(text.toLowerCase())
            );

            if (chapter) {
                navigation.navigate("Chapter", {
                    sourceId: novel.sourceId,
                    novelUrl: novel.novelUrl,
                    novelId: chapter.novelId,
                    chapterId: chapter.chapterId,
                    chapterUrl: chapter.chapterUrl,
                    chapterName: chapter.chapterName,
                    novelName: novel.novelName,
                    bookmark: chapter.bookmark,
                });
                hideModal();
            } else {
                setError(`Enter a valid chapter name`);
            }
        }
    };

    const onChangeText = (text) => setText(text);

    const textInputTheme = {
        colors: {
            primary: theme.colorAccent,
            placeholder: theme.textColorHint,
            text: theme.textColorPrimary,
            background: theme.colorPrimary,
        },
    };

    return (
        <Portal>
            <Modal
                visible={modalVisible}
                onDismiss={onDismiss}
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
                    Jump to Chapter
                </Text>
                <TextInput
                    value={text}
                    placeholder={
                        mode
                            ? "Chapter Name"
                            : `Chapter Number (<= ${chapters.length})`
                    }
                    onChangeText={onChangeText}
                    onSubmitEditing={onSubmit}
                    mode="outlined"
                    theme={textInputTheme}
                    underlineColor={theme.textColorHint}
                    dense
                    error={error}
                />
                <Text style={styles.errorText}>{error}</Text>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginTop: 4,
                    }}
                >
                    <Text style={{ color: theme.textColorPrimary }}>
                        Chapter Name
                    </Text>
                    <Switch
                        value={mode}
                        onValueChange={() => setMode(!mode)}
                        color={theme.colorAccent}
                    />
                </View>
            </Modal>
        </Portal>
    );
};

export default JumpToChapterModal;

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
});
