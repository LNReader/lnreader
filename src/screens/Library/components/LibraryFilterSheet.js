import React, { useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    Animated,
    useWindowDimensions,
} from "react-native";

import { TabView, SceneMap, TabBar } from "react-native-tab-view";

import Bottomsheet from "rn-sliding-up-panel";
import { filterLibrary } from "../../../redux/library/library.actions";
import { useSettings } from "../../../hooks/reduxHooks";
import { setAppSettings } from "../../../redux/settings/settings.actions";
import { Checkbox, SortItem } from "../../../components/Checkbox/Checkbox";

const LibraryFilterSheet = ({
    bottomSheetRef,
    dispatch,
    sort,
    filter,
    downloadedOnlyMode,
    theme,
}) => {
    const [animatedValue] = useState(new Animated.Value(0));

    const FirstRoute = () => (
        <View style={{ flex: 1, margin: 8 }}>
            <Checkbox
                label="Downloaded"
                theme={theme}
                status={
                    filter === "chaptersDownloaded > 0" ||
                    downloadedOnlyMode === true
                }
                onPress={() => {
                    if (!downloadedOnlyMode) {
                        filter === "chaptersDownloaded > 0"
                            ? dispatch(filterLibrary(sort, ""))
                            : dispatch(
                                  filterLibrary(sort, "chaptersDownloaded > 0")
                              );
                    }
                }}
            />
            <Checkbox
                label="Unread"
                theme={theme}
                status={filter === "unread = 1"}
                onPress={() =>
                    filter === "unread = 1"
                        ? dispatch(filterLibrary(sort, ""))
                        : dispatch(filterLibrary(sort, "unread = 1"))
                }
            />
            <Checkbox
                label="Completed"
                theme={theme}
                status={filter === "chaptersUnread IS NULL"}
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

    const sortOrders = [
        {
            label: "Date Added",
            ASC: "novels.novelId ASC",
            DESC: "novels.novelId DESC",
        },
        {
            label: "Aplhabetically",
            ASC: "novels.novelName ASC",
            DESC: "novels.novelName DESC",
        },
        {
            label: "Unread",
            ASC: "novels.unread ASC",
            DESC: "novels.unread DESC",
        },
        {
            label: "Downloaded",
            ASC: "chaptersDownloaded ASC",
            DESC: "chaptersDownloaded DESC",
        },
        {
            label: "Total Chapters",
            ASC: "chaptersUnread ASC",
            DESC: "chaptersUnread DESC",
        },
    ];

    const SecondRoute = () => (
        <View style={{ flex: 1, margin: 8 }}>
            {sortOrders.map((item, index) => (
                <SortItem
                    key={index}
                    label={item.label}
                    theme={theme}
                    status={
                        sort === item.ASC
                            ? "asc"
                            : sort === item.DESC
                            ? "desc"
                            : null
                    }
                    onPress={() =>
                        sort === item.ASC
                            ? dispatch(filterLibrary(item.DESC, filter))
                            : dispatch(filterLibrary(item.ASC, filter))
                    }
                />
            ))}
        </View>
    );

    const displayModes = [
        { displayMode: 0, label: "Compact Grid" },
        { displayMode: 1, label: "Comfortable Grid" },
        { displayMode: 3, label: "No Title Grid" },
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
            <Checkbox
                key={mode.displayMode}
                label={mode.label}
                status={displayMode === mode.displayMode}
                onPress={() =>
                    dispatch(setAppSettings("displayMode", mode.displayMode))
                }
                theme={theme}
            />
        ));
    };

    const ThirdRoute = () => (
        <View style={{ flex: 1, margin: 8 }}>
            <Text
                style={{
                    color: theme.textColorSecondary,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
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
                    paddingVertical: 8,
                    textTransform: "uppercase",
                }}
            >
                Badges
            </Text>
            <Checkbox
                label="Download Badges"
                status={showDownloadBadges}
                onPress={() =>
                    dispatch(
                        setAppSettings(
                            "showDownloadBadges",
                            !showDownloadBadges
                        )
                    )
                }
                theme={theme}
            />
            <Checkbox
                label="Unread Badges"
                status={showUnreadBadges}
                onPress={() =>
                    dispatch(
                        setAppSettings("showUnreadBadges", !showUnreadBadges)
                    )
                }
                theme={theme}
            />
            <Checkbox
                label="Show number of items"
                status={showNumberOfNovels}
                onPress={() =>
                    dispatch(
                        setAppSettings(
                            "showNumberOfNovels",
                            !showNumberOfNovels
                        )
                    )
                }
                theme={theme}
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
                <Text style={{ color }}>{route.title}</Text>
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
            draggableRange={{ top: 500, bottom: 0 }}
            snappingPoints={[0, 500]}
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
