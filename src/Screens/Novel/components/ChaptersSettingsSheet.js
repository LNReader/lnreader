import React, { useState } from "react";
import { StyleSheet, View, Text, Animated } from "react-native";
import { List, RadioButton, Checkbox } from "react-native-paper";
import Bottomsheet from "rn-sliding-up-panel";

import { useSelector } from "react-redux";
import { useTheme } from "../../../Hooks/reduxHooks";

const ChaptersSettingsSheet = ({
    bottomSheetRef,
    novelId,
    sortAndFilterChapters,
    dispatch,
    savedSort,
    savedFilter,
    theme,
}) => {
    const [sort, setSort] = useState(savedSort || "ORDER BY chapterId ASC");
    const [filter, setFilter] = useState(savedFilter || "");

    const sortChapters = (val) => {
        setSort(val);
        dispatch(sortAndFilterChapters(novelId, val, filter));
    };

    const filterChapters = (val) => {
        setFilter(val);
        dispatch(sortAndFilterChapters(novelId, sort, val));
    };

    const checkBoxStyle = { flexDirection: "row", alignItems: "center" };

    const [animatedValue] = useState(new Animated.Value(0));

    return (
        <Bottomsheet
            animatedValue={animatedValue}
            ref={bottomSheetRef}
            draggableRange={{ top: 370, bottom: 0 }}
            snappingPoints={[0, 370]}
        >
            <View
                style={[
                    styles.contentContainer,
                    {
                        backgroundColor: theme.colorPrimary,
                    },
                ]}
            >
                <View style={styles.bottomSheetHandle} />
                <List.Subheader
                    style={{
                        color: theme.textColorPrimary,
                        fontSize: 20,
                    }}
                >
                    Sort
                </List.Subheader>
                <View>
                    <RadioButton.Group
                        onValueChange={(newValue) =>
                            sortChapters(newValue, filter)
                        }
                        value={sort}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                <RadioButton.Item
                                    uncheckedColor={theme.textColorHint}
                                    color={theme.colorAccent}
                                    value="ORDER BY chapterId DESC"
                                />
                                <Text
                                    style={{
                                        color: theme.textColorPrimary,
                                    }}
                                >
                                    Newest to oldest
                                </Text>
                            </View>
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                <RadioButton.Item
                                    uncheckedColor={theme.textColorHint}
                                    color={theme.colorAccent}
                                    value="ORDER BY chapterId ASC"
                                />
                                <Text
                                    style={{
                                        color: theme.textColorPrimary,
                                    }}
                                >
                                    Oldest to newest
                                </Text>
                            </View>
                        </View>
                    </RadioButton.Group>
                </View>

                <List.Subheader
                    style={{
                        color: theme.textColorPrimary,
                        fontSize: 20,
                        paddingVertical: 10,
                    }}
                >
                    Filter
                </List.Subheader>
                <View style={checkBoxStyle}>
                    <Checkbox.Item
                        status={filter === "" ? "checked" : "unchecked"}
                        uncheckedColor={theme.textColorHint}
                        color={theme.colorAccent}
                        onPress={() => filterChapters("")}
                    />
                    <Text style={{ color: theme.textColorPrimary }}>
                        Show all
                    </Text>
                </View>
                <View style={checkBoxStyle}>
                    <Checkbox.Item
                        status={
                            filter === "AND `read`=1" ? "checked" : "unchecked"
                        }
                        uncheckedColor={theme.textColorHint}
                        color={theme.colorAccent}
                        onPress={() => filterChapters("AND `read`=1")}
                    />
                    <Text style={{ color: theme.textColorPrimary }}>
                        Show read chapters
                    </Text>
                </View>
                <View style={checkBoxStyle}>
                    <Checkbox.Item
                        status={
                            filter === "AND `read`=0" ? "checked" : "unchecked"
                        }
                        uncheckedColor={theme.textColorHint}
                        color={theme.colorAccent}
                        onPress={() => filterChapters("AND `read`=0")}
                    />
                    <Text style={{ color: theme.textColorPrimary }}>
                        Show unread chapters
                    </Text>
                </View>
                <View style={checkBoxStyle}>
                    <Checkbox.Item
                        status={
                            filter === "AND downloaded=1"
                                ? "checked"
                                : "unchecked"
                        }
                        uncheckedColor={theme.textColorHint}
                        color={theme.colorAccent}
                        onPress={() => filterChapters("AND downloaded=1")}
                    />
                    <Text style={{ color: theme.textColorPrimary }}>
                        Show downloaded chapters
                    </Text>
                </View>
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
    bottomSheetHandle: {
        backgroundColor: "rgba(255,255,255,0.25)",
        height: 4,
        width: 50,
        borderRadius: 50,
        top: 10,
        alignSelf: "center",
    },
});
