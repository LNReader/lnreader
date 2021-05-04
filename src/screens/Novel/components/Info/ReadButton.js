import React from "react";
import { StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { useSelector } from "react-redux";

const ReadButton = ({ navigation, novel, chapters, theme }) => {
    let lastRead;
    let novelSettings = useSelector(
        (state) => state.preferenceReducer.novelSettings
    );

    let currentNovel = novelSettings.find(
        (obj) => obj.novelId === novel.novelId
    );

    if (currentNovel && currentNovel.lastRead) {
        lastRead = chapters.find(
            (obj) => obj.chapterId === currentNovel.lastRead
        );
    } else {
        lastRead = chapters.find((obj) => obj.read === 0);
    }

    return (
        chapters.length > 0 &&
        (lastRead ? (
            <Button
                color="white"
                style={[
                    { backgroundColor: theme.colorAccentDark },
                    styles.startButton,
                ]}
                uppercase={false}
                labelStyle={{ letterSpacing: 0 }}
                onPress={() => {
                    navigation.navigate("Chapter", {
                        chapterId: lastRead.chapterId,
                        chapterUrl: lastRead.chapterUrl,
                        novelUrl: novel.novelUrl,
                        novelId: lastRead.novelId,
                        extensionId: novel.sourceId,
                        chapterName: lastRead.chapterName,
                    });
                }}
            >
                {novel.unread ? `Start reading ` : `Continue reading `}
                {lastRead.chapterName}
            </Button>
        ) : (
            <Button
                color={theme.textColorHintDark}
                style={[
                    styles.startButton,
                    { backgroundColor: theme.colorDisabled },
                ]}
                uppercase={false}
                labelStyle={{ letterSpacing: 0 }}
            >
                All chapters read
            </Button>
        ))
    );
};

export default ReadButton;

const styles = StyleSheet.create({
    startButton: {
        marginTop: 8,
        marginBottom: 16,
        marginHorizontal: 16,
    },
});
