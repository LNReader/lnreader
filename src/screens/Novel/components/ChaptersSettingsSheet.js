import React, { useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    Animated,
    useWindowDimensions,
} from "react-native";

import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { Checkbox as PaperCheckbox } from "react-native-paper";
import Bottomsheet from "rn-sliding-up-panel";

import { Checkbox, SortItem } from "../../../components/Checkbox/Checkbox";

import { showChapterTitlesAction } from "../../../redux/novel/novel.actions";

const ChaptersSettingsSheet = ({
    bottomSheetRef,
    novelId,
    sortAndFilterChapters,
    dispatch,
    sort,
    filter,
    theme,
    showChapterTitles,
}) => {
    const sortChapters = (val) =>
        dispatch(sortAndFilterChapters(novelId, val, filter));

    const filterChapters = (val) =>
        dispatch(sortAndFilterChapters(novelId, sort, val));

    const [animatedValue] = useState(new Animated.Value(0));

    const FirstRoute = () => (
        <View style={{ flex: 1 }}>
            <PaperCheckbox.Item
                label="Downloaded"
                labelStyle={{
                    fontSize: 14,
                    color: theme.textColorPrimary,
                }}
                color={theme.colorAccent}
                uncheckedColor={theme.textColorHint}
                status={
                    filter.match("AND downloaded=1") ? "checked" : "unchecked"
                }
                onPress={() =>
                    filter.match("AND downloaded=1")
                        ? filterChapters(
                              filter.replace(" AND downloaded=1", "")
                          )
                        : filterChapters(filter + " AND downloaded=1")
                }
            />
            <PaperCheckbox.Item
                label="Unread"
                labelStyle={{
                    fontSize: 14,
                    color: theme.textColorPrimary,
                }}
                color={theme.colorAccent}
                uncheckedColor={theme.textColorHint}
                status={
                    filter.match("AND `read`=0")
                        ? "checked"
                        : filter.match("AND `read`=1")
                        ? "indeterminate"
                        : "unchecked"
                }
                onPress={() => {
                    if (filter.match("AND `read`=0")) {
                        filterChapters(
                            filter.replace(" AND `read`=0", " AND `read`=1")
                        );
                    } else if (filter.match("AND `read`=1")) {
                        filterChapters(filter.replace(" AND `read`=1", ""));
                    } else {
                        filterChapters(filter + " AND `read`=0");
                    }
                }}
            />
            <PaperCheckbox.Item
                label="Bookmarked"
                labelStyle={{
                    fontSize: 14,
                    color: theme.textColorPrimary,
                }}
                color={theme.colorAccent}
                uncheckedColor={theme.textColorHint}
                status={
                    filter.match("AND bookmark=1") ? "checked" : "unchecked"
                }
                onPress={() => {
                    filter.match("AND bookmark=1")
                        ? filterChapters(filter.replace(" AND bookmark=1", ""))
                        : filterChapters(filter + " AND bookmark=1");
                }}
            />
        </View>
    );

    const SecondRoute = () => (
        <View style={{ flex: 1, margin: 8 }}>
            <SortItem
                label="By source"
                status={sort === "ORDER BY chapterId ASC" ? "asc" : "desc"}
                onPress={() =>
                    sort === "ORDER BY chapterId ASC"
                        ? sortChapters("ORDER BY chapterId DESC")
                        : sortChapters("ORDER BY chapterId ASC")
                }
                theme={theme}
            />
        </View>
    );

    const ThirdRoute = () => (
        <View style={{ flex: 1, padding: 8 }}>
            <Checkbox
                status={!showChapterTitles}
                label="Source title"
                onPress={() =>
                    dispatch(showChapterTitlesAction(novelId, false))
                }
                theme={theme}
            />
            <Checkbox
                status={showChapterTitles}
                label="Chapter number"
                onPress={() => dispatch(showChapterTitlesAction(novelId, true))}
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
            draggableRange={{ top: 220, bottom: 0 }}
            snappingPoints={[0, 220]}
        >
            <View
                style={[
                    styles.contentContainer,
                    { backgroundColor: theme.colorPrimary },
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

export default ChaptersSettingsSheet;

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        borderTopRightRadius: 8,
        borderTopLeftRadius: 8,
    },
});
