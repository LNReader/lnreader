import React from "react";
import { StyleSheet, View, Text, Animated } from "react-native";
import { List, RadioButton, Checkbox } from "react-native-paper";
import Bottomsheet from "rn-sliding-up-panel";
import { theme } from "../theme/theme";

const BottomSheetHandle = () => (
    <View
        style={{
            backgroundColor: "rgba(255,255,255,0.25)",
            height: 4,
            width: 50,
            borderRadius: 50,
            top: 10,
            alignSelf: "center",
        }}
    />
);

import { useSelector } from "react-redux";

export const BottomSheet = ({
    bottomSheetRef,
    sort,
    filter,
    sortChapters,
    filterChapters,
}) => {
    const checkBoxStyle = { flexDirection: "row", alignItems: "center" };

    const theme = useSelector((state) => state.themeReducer.theme);

    return (
        <Bottomsheet
            ref={bottomSheetRef}
            draggableRange={{ top: 370, bottom: 0 }}
            snappingPoints={[0, 370]}
        >
            <View
                style={[
                    styles.contentContainer,
                    {
                        backgroundColor: theme.colorDarkPrimary,
                    },
                ]}
            >
                <BottomSheetHandle />
                <List.Subheader
                    style={{
                        color: theme.textColorPrimaryDark,
                        fontSize: 20,
                    }}
                >
                    Sort
                </List.Subheader>
                <View>
                    <RadioButton.Group
                        onValueChange={(newValue) => sortChapters(newValue)}
                        value={sort}
                        c
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
                                    uncheckedColor={theme.textColorHintDark}
                                    color={theme.colorAccentDark}
                                    value="ORDER BY chapterId DESC"
                                />
                                <Text
                                    style={{
                                        color: theme.textColorPrimaryDark,
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
                                    uncheckedColor={theme.textColorHintDark}
                                    color={theme.colorAccentDark}
                                    value=""
                                />
                                <Text
                                    style={{
                                        color: theme.textColorPrimaryDark,
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
                        color: theme.textColorPrimaryDark,
                        fontSize: 20,
                        paddingVertical: 10,
                    }}
                >
                    Filter
                </List.Subheader>
                <View style={checkBoxStyle}>
                    <Checkbox.Item
                        status={filter === "" ? "checked" : "unchecked"}
                        uncheckedColor={theme.textColorHintDark}
                        color={theme.colorAccentDark}
                        onPress={() => filterChapters("")}
                    />
                    <Text style={{ color: "white" }}>Show all</Text>
                </View>
                <View style={checkBoxStyle}>
                    <Checkbox.Item
                        status={
                            filter === "AND `read`=1" ? "checked" : "unchecked"
                        }
                        uncheckedColor={theme.textColorHintDark}
                        color={theme.colorAccentDark}
                        onPress={() => filterChapters("AND `read`=1")}
                    />
                    <Text style={{ color: "white" }}>Show read chapters</Text>
                </View>
                <View style={checkBoxStyle}>
                    <Checkbox.Item
                        status={
                            filter === "AND `read`=0" ? "checked" : "unchecked"
                        }
                        uncheckedColor={theme.textColorHintDark}
                        color={theme.colorAccentDark}
                        onPress={() => filterChapters("AND `read`=0")}
                    />
                    <Text style={{ color: "white" }}>Show unread chapters</Text>
                </View>
                <View style={checkBoxStyle}>
                    <Checkbox.Item
                        status={
                            filter === "AND downloaded=1"
                                ? "checked"
                                : "unchecked"
                        }
                        uncheckedColor={theme.textColorHintDark}
                        color={theme.colorAccentDark}
                        onPress={() => filterChapters("AND downloaded=1")}
                    />
                    <Text style={{ color: "white" }}>
                        Show downloaded chapters
                    </Text>
                </View>
            </View>
        </Bottomsheet>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
    },
});
