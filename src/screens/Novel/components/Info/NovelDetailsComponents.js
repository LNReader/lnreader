import React from "react";
import {
    FlatList,
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    View,
    Pressable,
} from "react-native";

import { Chip, IconButton } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import easeGradient from "react-native-easing-gradient";
import FastImage from "react-native-fast-image";

const NovelInfoContainer = ({ children }) => (
    <View style={styles.novelInfoContainer}>{children}</View>
);

const CoverImage = ({ children, source, theme }) => {
    const { colors, locations } = easeGradient({
        colorStops: {
            0: { color: "rgba(0,0,0,0.2)" },
            1: { color: theme.colorPrimaryDark },
        },
    });

    return (
        <FastImage source={source} style={styles.coverImage}>
            <LinearGradient
                colors={colors}
                locations={locations}
                style={styles.linearGradient}
            >
                {children}
            </LinearGradient>
        </FastImage>
    );
};

const NovelThumbnail = ({ source }) => (
    <FastImage source={source} style={styles.novelThumbnail} />
);

const NovelTitle = ({ theme, children, onLongPress, onPress }) => (
    <Text
        onLongPress={onLongPress}
        onPress={onPress}
        numberOfLines={2}
        style={[styles.novelTitle, { color: theme.textColorPrimary }]}
    >
        {children}
    </Text>
);

const NovelAuthor = ({ theme, children }) => (
    <Text
        style={[styles.novelAuthor, { color: theme.textColorSecondary }]}
        numberOfLines={2}
    >
        {children}
    </Text>
);

const NovelInfo = ({ theme, children }) => (
    <Text
        style={[styles.novelInfo, { color: theme.textColorSecondary }]}
        numberOfLines={1}
    >
        {children}
    </Text>
);

const FollowButton = ({ theme, onPress, followed }) => (
    <View style={{ borderRadius: 4, overflow: "hidden", flex: 1 }}>
        <Pressable
            android_ripple={{
                color: theme.rippleColor,
                borderless: false,
            }}
            onPress={onPress}
            style={{
                justifyContent: "center",
                alignItems: "center",
                paddingBottom: 8,
            }}
        >
            <IconButton
                icon={followed ? "heart" : "heart-outline"}
                color={followed ? theme.colorAccent : theme.textColorSecondary}
                size={24}
                style={{ margin: 0 }}
            />
            <Text
                style={{
                    fontSize: 12,
                    color: followed
                        ? theme.colorAccent
                        : theme.textColorSecondary,
                }}
            >
                {followed ? "In Library" : "Add to library"}
            </Text>
        </Pressable>
    </View>
);

const TrackerButton = ({ theme, isTracked, onPress }) => (
    <View style={{ borderRadius: 4, overflow: "hidden", flex: 1 }}>
        <Pressable
            android_ripple={{
                color: theme.rippleColor,
                borderless: false,
            }}
            onPress={onPress}
            style={{
                justifyContent: "center",
                alignItems: "center",
                paddingBottom: 8,
            }}
        >
            <IconButton
                icon={isTracked ? "check" : "sync"}
                color={isTracked ? theme.colorAccent : theme.textColorSecondary}
                size={24}
                style={{ margin: 0 }}
            />
            <Text
                style={{
                    fontSize: 12,
                    color: isTracked
                        ? theme.colorAccent
                        : theme.textColorSecondary,
                }}
            >
                {isTracked ? "Tracked" : "Tracking"}
            </Text>
        </Pressable>
    </View>
);

const GenreChip = ({ children, theme }) => (
    <Text
        style={[
            styles.genreChip,
            {
                color: theme.colorAccent,
                borderColor: theme.colorAccent,
                backgroundColor: theme.colorPrimary,
            },
        ]}
    >
        {children}
    </Text>
);

const NovelGenres = ({ theme, genre }) => {
    const data = genre.split(",");

    const renderItem = ({ item }) => (
        <GenreChip theme={theme}>{item}</GenreChip>
    );

    return (
        genre !== "" && (
            <FlatList
                contentContainerStyle={styles.novelGenres}
                horizontal
                data={data}
                keyExtractor={(item) => item}
                renderItem={renderItem}
                showsHorizontalScrollIndicator={false}
            />
        )
    );
};

export {
    NovelInfoContainer,
    CoverImage,
    NovelThumbnail,
    NovelTitle,
    NovelAuthor,
    NovelInfo,
    FollowButton,
    TrackerButton,
    NovelGenres,
};

const styles = StyleSheet.create({
    novelInfoContainer: {
        flex: 1,
        flexDirection: "row",
        margin: 16,
        paddingTop: 90,
    },
    coverImage: {
        height: 285,
    },
    linearGradient: {
        height: 286,
    },
    novelThumbnail: {
        height: 160,
        width: 110,
        margin: 3.2,
        borderRadius: 6,
    },
    novelTitle: {
        fontWeight: "bold",
        fontSize: 18,
    },
    novelAuthor: {
        marginVertical: 3,
        fontSize: 14,
        fontWeight: "bold",
    },
    novelInfo: {
        marginVertical: 3,
        fontSize: 14,
    },
    followButton: {
        height: 32,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 16,
        paddingLeft: 4,
        borderWidth: 0,
        elevation: 0,
    },
    novelGenres: {
        // marginTop: 12,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    genreChip: {
        flex: 1,
        justifyContent: "center",
        paddingVertical: 2,
        paddingHorizontal: 10,
        marginHorizontal: 2,
        fontSize: 13,
        borderWidth: 1,
        borderRadius: 50,
    },
});
