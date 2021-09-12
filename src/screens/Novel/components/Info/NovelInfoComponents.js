import React, { useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    View,
    Pressable,
    Dimensions,
    StatusBar,
} from "react-native";

import { IconButton, Portal } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import easeGradient from "react-native-easing-gradient";
import FastImage from "react-native-fast-image";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

const NovelInfoContainer = ({ children }) => (
    <View style={styles.novelInfoContainer}>{children}</View>
);

const CoverImage = ({ children, source, theme, hideBackdrop }) => {
    const { colors, locations } = easeGradient({
        colorStops: {
            0: { color: "rgba(0,0,0,0)" },
            1: { color: theme.colorPrimaryDark },
        },
    });

    if (hideBackdrop) {
        return <View>{children}</View>;
    } else {
        return (
            <FastImage source={source} style={styles.coverImage}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: `${theme.colorPrimaryDark}B4`,
                    }}
                >
                    <LinearGradient
                        colors={colors}
                        locations={locations}
                        style={styles.linearGradient}
                    >
                        {children}
                    </LinearGradient>
                </View>
            </FastImage>
        );
    }
};

const NovelThumbnail = ({ source, setCustomNovelCover }) => {
    const [expanded, setExpanded] = useState(false);

    if (!expanded) {
        return (
            <TouchableWithoutFeedback onPress={() => setExpanded(!expanded)}>
                <FastImage source={source} style={styles.novelThumbnail} />
            </TouchableWithoutFeedback>
        );
    } else {
        return (
            <Portal>
                <IconButton
                    icon="close"
                    style={{
                        position: "absolute",
                        top: StatusBar.currentHeight,
                        left: 0,
                        zIndex: 10,
                    }}
                    onPress={() => setExpanded(false)}
                />
                <IconButton
                    icon="pencil-outline"
                    style={{
                        position: "absolute",
                        top: StatusBar.currentHeight,
                        right: 0,
                        zIndex: 10,
                    }}
                    onPress={setCustomNovelCover}
                />
                <Pressable
                    style={{
                        position: "absolute",
                        width: Dimensions.get("window").width,
                        height: Dimensions.get("window").height + 60,
                        justifyContent: "center",
                        backgroundColor: "rgba(0,0,0,0.7)",
                    }}
                    onPress={() => setExpanded(false)}
                >
                    <FastImage
                        source={source}
                        style={{
                            width: Dimensions.get("window").width,
                            height: (Dimensions.get("window").width * 3) / 2,
                        }}
                    />
                </Pressable>
            </Portal>
        );
    }
};

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
                color={followed ? theme.colorAccent : theme.textColorHint}
                size={24}
                style={{ margin: 0 }}
            />
            <Text
                style={{
                    fontSize: 12,
                    color: followed ? theme.colorAccent : theme.textColorHint,
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
                color={isTracked ? theme.colorAccent : theme.textColorHint}
                size={24}
                style={{ margin: 0 }}
            />
            <Text
                style={{
                    fontSize: 12,
                    color: isTracked ? theme.colorAccent : theme.textColorHint,
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
                color: theme.textColorPrimary,
                backgroundColor: theme.dividerColor,
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
        <FlatList
            contentContainerStyle={styles.novelGenres}
            horizontal
            data={data}
            keyExtractor={(item) => item}
            renderItem={renderItem}
            showsHorizontalScrollIndicator={false}
        />
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
        flexDirection: "row",
        margin: 16,
        marginTop: 28,
        marginBottom: 0,
        paddingTop: 90,
    },
    coverImage: {
        height: 270,
    },
    linearGradient: {
        height: 271,
    },
    novelThumbnail: {
        height: 150,
        width: 100,
        marginHorizontal: 4,
        borderRadius: 6,
    },
    novelTitle: {
        fontSize: 18,
    },
    novelAuthor: {
        marginVertical: 5,
        fontSize: 14,
        fontWeight: "bold",
    },
    novelInfo: {
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
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    genreChip: {
        flex: 1,
        justifyContent: "center",
        paddingVertical: 5,
        paddingHorizontal: 12,
        marginHorizontal: 2,
        fontSize: 12,
        borderRadius: 50,
        textTransform: "capitalize",
    },
});
