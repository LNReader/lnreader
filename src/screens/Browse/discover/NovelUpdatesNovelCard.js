import React from "react";
import { StyleSheet, Pressable, Text, View, FlatList } from "react-native";
import FastImage from "react-native-fast-image";
import { Row } from "../../../components/Common";

const GenreChip = ({ children, theme }) => (
    <Text
        style={[
            styles.genreChip,
            {
                color: theme.colorAccent,
                borderColor: theme.colorAccent,
            },
        ]}
        numberOfLines={1}
    >
        {children}
    </Text>
);

const NovelUpdatesNovelCard = ({ novel, theme, onPress }) => {
    return (
        <Pressable
            style={styles.novelUpdatesCard}
            onPress={onPress}
            android_ripple={{ color: theme.rippleColor }}
        >
            <View style={{ flex: 1, flexDirection: "row" }}>
                <FastImage
                    source={{ uri: novel.novelCover }}
                    style={{ width: 85, height: 120, borderRadius: 4 }}
                />
                <View style={{ flex: 1, paddingLeft: 16 }}>
                    <Text
                        style={{ color: theme.textColorPrimary, fontSize: 16 }}
                    >
                        {novel.novelName}
                    </Text>

                    <GenreChip theme={theme}>{novel.genres}</GenreChip>

                    <Text
                        style={{
                            fontSize: 13,
                            color: theme.textColorPrimary,
                        }}
                        numberOfLines={3}
                    >
                        {novel.novelSummary}
                    </Text>
                </View>
            </View>
        </Pressable>
    );
};

export default NovelUpdatesNovelCard;

const styles = StyleSheet.create({
    novelUpdatesCard: {
        flex: 1,
        padding: 16,
    },
    contentContainer: {
        flex: 1,
    },
    genreChip: {
        marginVertical: 4,
        fontSize: 12,
        // fontStyle: "italic",
    },
});
