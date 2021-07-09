import React from "react";
import {
    StyleSheet,
    View,
    Text,
    useWindowDimensions,
    Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableRipple } from "react-native-paper";

import { useSelector } from "react-redux";
import { useSettings, useTheme } from "../hooks/reduxHooks";
import ListView from "./ListView";
import FastImage from "react-native-fast-image";
import { getDeviceOrientation } from "../services/utils/helpers";

const NovelCover = ({ item, onPress, libraryStatus }) => {
    const theme = useTheme();
    const { displayMode, novelsPerRow, showDownloadBadges, showUnreadBadges } =
        useSettings();

    const window = useWindowDimensions();

    const orientation = getDeviceOrientation();

    const getNovelsPerRow = () =>
        orientation === "landscape" ? 6 : novelsPerRow;

    const getHeight = () => (window.width / getNovelsPerRow()) * (4 / 3);

    const comfortableTitle = () =>
        displayMode === 1 && (
            <Text
                numberOfLines={2}
                style={[
                    styles.title,
                    {
                        color: theme.textColorPrimary,
                        padding: 4,
                    },
                ]}
            >
                {item.novelName}
            </Text>
        );

    const compactTitle = () =>
        displayMode === 0 && (
            <View style={styles.titleContainer}>
                <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.7)"]}
                    style={styles.linearGradient}
                >
                    <Text
                        numberOfLines={2}
                        style={[styles.title, { color: "rgba(255,255,255,1)" }]}
                    >
                        {item.novelName}
                    </Text>
                </LinearGradient>
            </View>
        );

    const unreadBadge = () =>
        showUnreadBadges &&
        item.chaptersUnread && (
            <Text
                style={[
                    styles.unreadBadge,
                    !item.chaptersDownloaded && {
                        borderTopLeftRadius: 4,
                        borderBottomLeftRadius: 4,
                    },
                    !showDownloadBadges && {
                        borderRadius: 4,
                    },
                    {
                        backgroundColor: theme.colorAccent,
                        color: theme.colorButtonText,
                    },
                ]}
            >
                {item.chaptersUnread}
            </Text>
        );

    const downloadBadge = () =>
        showDownloadBadges &&
        item.chaptersDownloaded && (
            <Text
                style={[
                    styles.downloadBadge,
                    !item.chaptersUnread && {
                        borderTopRightRadius: 4,
                        borderBottomRightRadius: 4,
                    },
                    !showUnreadBadges && {
                        borderRadius: 4,
                    },
                ]}
            >
                {item.chaptersDownloaded}
            </Text>
        );

    const inLibraryBadge = () =>
        libraryStatus && (
            <Text
                style={[
                    styles.inLibraryBadge,
                    {
                        backgroundColor: theme.colorAccent,
                        color: theme.colorButtonText,
                        borderRadius: 4,
                    },
                ]}
            >
                In library
            </Text>
        );

    return displayMode !== 2 ? (
        <View
            style={{
                flex: 1 / getNovelsPerRow(),
                borderRadius: 4,
                overflow: "hidden",
            }}
        >
            <Pressable
                android_ripple={{ color: theme.colorAccent }}
                style={styles.opac}
                onPress={onPress}
            >
                <>
                    <View
                        style={{
                            position: "absolute",
                            zIndex: 1,
                            top: 8,
                            left: 8,
                            flexDirection: "row",
                        }}
                    >
                        {inLibraryBadge()}
                        {downloadBadge()}
                        {unreadBadge()}
                    </View>
                    <FastImage
                        source={{ uri: item.novelCover }}
                        style={[
                            { height: getHeight(), borderRadius: 4 },
                            libraryStatus && { opacity: 0.5 },
                        ]}
                    />
                    <View
                        style={{
                            position: "absolute",
                            bottom: 4,
                            left: 4,
                            right: 4,
                        }}
                    >
                        {compactTitle()}
                    </View>
                    {comfortableTitle()}
                </>
            </Pressable>
        </View>
    ) : (
        <ListView
            item={item}
            downloadBadge={downloadBadge()}
            unreadBadge={unreadBadge()}
            inLibraryBadge={inLibraryBadge()}
            theme={theme}
            onPress={onPress}
        />
    );
};

export default NovelCover;

const styles = StyleSheet.create({
    titleContainer: {
        flex: 1,
        borderRadius: 4,
    },
    title: {
        fontFamily: "pt-sans-bold",
        fontSize: 14,
        padding: 8,
    },
    linearGradient: {
        bottom: -1,
        borderRadius: 4,
    },
    opac: {
        paddingHorizontal: 4.5,
        paddingVertical: 4,
        borderRadius: 4,
        flex: 1,
    },
    extensionIcon: {
        width: 42,
        height: 42,
        borderRadius: 4,
    },
    listView: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 4,
    },

    downloadBadge: {
        backgroundColor: "#47a84a",
        color: "#FFFFFF",
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
        paddingTop: 2,
        paddingHorizontal: 4,
        fontSize: 12,
    },
    unreadBadge: {
        color: "#FFFFFF",
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        paddingTop: 2,
        paddingHorizontal: 4,
        fontSize: 12,
    },
    inLibraryBadge: {
        paddingVertical: 2,
        paddingHorizontal: 4,
        fontSize: 12,
    },
});
