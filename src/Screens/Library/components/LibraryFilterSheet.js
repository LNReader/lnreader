import React, { useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    Animated,
    useWindowDimensions,
} from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";

import { Checkbox } from "react-native-paper";

import Bottomsheet from "rn-sliding-up-panel";
import { ListItem } from "../../../Components/List";
import { filterLibrary } from "../../../redux/library/library.actions";
import { useSettings } from "../../../Hooks/reduxHooks";
import { setAppSettings } from "../../../redux/settings/settings.actions";

const LibraryFilterSheet = ({
    bottomSheetRef,
    dispatch,
    sort,
    filter,
    theme,
}) => {
    const [animatedValue] = useState(new Animated.Value(0));

    const FirstRoute = () => (
        <View style={{ flex: 1 }}>
            <Checkbox.Item
                label="Downloaded"
                labelStyle={{
                    fontSize: 14,
                    color: theme.textColorPrimary,
                }}
                color={theme.colorAccent}
                uncheckedColor={theme.textColorHint}
                status={
                    filter === "chaptersDownloaded > 0"
                        ? "checked"
                        : "unchecked"
                }
                onPress={() =>
                    filter === "chaptersDownloaded > 0"
                        ? dispatch(filterLibrary(sort, ""))
                        : dispatch(
                              filterLibrary(sort, "chaptersDownloaded > 0")
                          )
                }
            />
            <Checkbox.Item
                label="Unread"
                labelStyle={{
                    fontSize: 14,
                    color: theme.textColorPrimary,
                }}
                color={theme.colorAccent}
                uncheckedColor={theme.textColorHint}
                status={filter === "unread = 1" ? "checked" : "unchecked"}
                onPress={() =>
                    filter === "unread = 1"
                        ? dispatch(filterLibrary(sort, ""))
                        : dispatch(filterLibrary(sort, "unread = 1"))
                }
            />
            <Checkbox.Item
                label="Completed"
                labelStyle={{
                    fontSize: 14,
                    color: theme.textColorPrimary,
                }}
                color={theme.colorAccent}
                uncheckedColor={theme.textColorHint}
                status={
                    filter === "chaptersUnread IS NULL"
                        ? "checked"
                        : "unchecked"
                }
                onPress={() =>
                    filter === "chaptersUnread IS NULL"
                        ? dispatch(filterLibrary(sort, ""))
                        : dispatch(
                              filterLibrary(sort, "chaptersUnread IS NULL")
                          )
                }
            />
        </View>
    );

    const SecondRoute = () => (
        <View style={{ flex: 1 }}>
            <ListItem
                style={{ paddingVertical: 10 }}
                title="Date Added"
                titleStyle={{ fontSize: 14 }}
                theme={theme}
                right={
                    sort === "novels.novelId ASC"
                        ? "arrow-up"
                        : sort === "novels.novelId DESC"
                        ? "arrow-down"
                        : null
                }
                iconColor={theme.colorAccent}
                onPress={() =>
                    sort === "novels.novelId ASC"
                        ? dispatch(filterLibrary("novels.novelId DESC", filter))
                        : dispatch(filterLibrary("novels.novelId ASC", filter))
                }
            />
            <ListItem
                style={{ paddingVertical: 10 }}
                title="Alphabetically"
                titleStyle={{ fontSize: 14 }}
                theme={theme}
                right={
                    sort === "novels.novelName ASC"
                        ? "arrow-up"
                        : sort === "novels.novelName DESC"
                        ? "arrow-down"
                        : null
                }
                iconColor={theme.colorAccent}
                onPress={() =>
                    sort === "novels.novelName ASC"
                        ? dispatch(
                              filterLibrary("novels.novelName DESC", filter)
                          )
                        : dispatch(
                              filterLibrary("novels.novelName ASC", filter)
                          )
                }
            />
            <ListItem
                style={{ paddingVertical: 10 }}
                title="Unread"
                titleStyle={{ fontSize: 14 }}
                theme={theme}
                right={
                    sort === "novels.unread ASC"
                        ? "arrow-up"
                        : sort === "novels.unread DESC"
                        ? "arrow-down"
                        : null
                }
                iconColor={theme.colorAccent}
                onPress={() =>
                    sort === "novels.unread ASC"
                        ? dispatch(filterLibrary("novels.unread DESC", filter))
                        : dispatch(filterLibrary("novels.unread ASC", filter))
                }
            />
            <ListItem
                style={{ paddingVertical: 10 }}
                title="Downloaded"
                titleStyle={{ fontSize: 14 }}
                theme={theme}
                right={
                    sort === "chaptersDownloaded ASC"
                        ? "arrow-up"
                        : sort === "chaptersDownloaded DESC"
                        ? "arrow-down"
                        : null
                }
                iconColor={theme.colorAccent}
                onPress={() =>
                    sort === "chaptersDownloaded ASC"
                        ? dispatch(
                              filterLibrary("chaptersDownloaded DESC", filter)
                          )
                        : dispatch(
                              filterLibrary("chaptersDownloaded ASC", filter)
                          )
                }
            />
            <ListItem
                style={{ paddingVertical: 10 }}
                title="Total Chapters"
                titleStyle={{ fontSize: 14 }}
                theme={theme}
                right={
                    sort === "chaptersUnread ASC"
                        ? "arrow-up"
                        : sort === "chaptersUnread DESC"
                        ? "arrow-down"
                        : null
                }
                iconColor={theme.colorAccent}
                onPress={() =>
                    sort === "chaptersUnread ASC"
                        ? dispatch(filterLibrary("chaptersUnread DESC", filter))
                        : dispatch(filterLibrary("chaptersUnread ASC", filter))
                }
            />
        </View>
    );

    const displayModes = [
        { displayMode: 0, label: "Compact Grid" },
        { displayMode: 1, label: "Comfortable Grid" },
        { displayMode: 2, label: "List" },
    ];

    const {
        displayMode,
        showDownloadBadges,
        showUnreadBadges,
        showNumberOfNovels,
    } = useSettings();

    const renderCheckboxes = () => {
        return displayModes.map((mode) => (
            <Checkbox.Item
                key={mode.displayMode}
                label={mode.label}
                labelStyle={{ color: theme.textColorPrimary, fontSize: 14 }}
                status={
                    displayMode === mode.displayMode ? "checked" : "unchecked"
                }
                // mode="ios"
                uncheckedColor={theme.textColorSecondary}
                color={theme.colorAccent}
                onPress={() =>
                    dispatch(setAppSettings("displayMode", mode.displayMode))
                }
            />
        ));
    };

    const ThirdRoute = () => (
        <View style={{ flex: 1 }}>
            <Text
                style={{
                    color: theme.textColorSecondary,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    textTransform: "uppercase",
                }}
            >
                Display Mode
            </Text>
            {renderCheckboxes()}

            <Text
                style={{
                    color: theme.textColorSecondary,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    textTransform: "uppercase",
                }}
            >
                Badges
            </Text>
            <Checkbox.Item
                label="Download Badges"
                labelStyle={{ color: theme.textColorPrimary, fontSize: 14 }}
                status={showDownloadBadges ? "checked" : "unchecked"}
                uncheckedColor={theme.textColorSecondary}
                color={theme.colorAccent}
                onPress={() =>
                    dispatch(
                        setAppSettings(
                            "showDownloadBadges",
                            !showDownloadBadges
                        )
                    )
                }
            />
            <Checkbox.Item
                label="Unread Badges"
                labelStyle={{ color: theme.textColorPrimary, fontSize: 14 }}
                status={showUnreadBadges ? "checked" : "unchecked"}
                uncheckedColor={theme.textColorSecondary}
                color={theme.colorAccent}
                onPress={() =>
                    dispatch(
                        setAppSettings("showUnreadBadges", !showUnreadBadges)
                    )
                }
            />
            <Checkbox.Item
                label="Show number of items"
                labelStyle={{ color: theme.textColorPrimary, fontSize: 14 }}
                status={showNumberOfNovels ? "checked" : "unchecked"}
                uncheckedColor={theme.textColorSecondary}
                color={theme.colorAccent}
                onPress={() =>
                    dispatch(
                        setAppSettings(
                            "showNumberOfNovels",
                            !showNumberOfNovels
                        )
                    )
                }
            />
        </View>
    );

    const renderScene = SceneMap({
        first: FirstRoute,
        second: SecondRoute,
        third: ThirdRoute,
    });

    const layout = useWindowDimensions();

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: "first", title: "Filter" },
        { key: "second", title: "Sort" },
        { key: "third", title: "Display" },
    ]);

    const renderTabBar = (props) => (
        <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: theme.colorAccent }}
            style={{ backgroundColor: theme.colorPrimary }}
            renderLabel={({ route, focused, color }) => (
                <Text style={{ color, margin: 8 }}>{route.title}</Text>
            )}
            inactiveColor={theme.textColorSecondary}
            activeColor={theme.colorAccent}
            pressColor={theme.rippleColor}
        />
    );

    return (
        <Bottomsheet
            animatedValue={animatedValue}
            ref={bottomSheetRef}
            draggableRange={{ top: 470, bottom: 0 }}
            snappingPoints={[0, 470]}
        >
            <View
                style={[
                    styles.contentContainer,
                    { backgroundColor: theme.colorPrimaryDark },
                ]}
            >
                <TabView
                    navigationState={{ index, routes }}
                    renderTabBar={renderTabBar}
                    renderScene={renderScene}
                    onIndexChange={setIndex}
                    initialLayout={{ width: layout.width }}
                    style={{ borderTopRightRadius: 8, borderTopLeftRadius: 8 }}
                />
            </View>
        </Bottomsheet>
    );
};

export default LibraryFilterSheet;

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        borderTopRightRadius: 8,
        borderTopLeftRadius: 8,
    },
});
