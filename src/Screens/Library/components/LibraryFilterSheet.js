import React, { useState } from "react";
import { StyleSheet, View, Text, Animated } from "react-native";

import { List, RadioButton, Checkbox } from "react-native-paper";

import Bottomsheet from "rn-sliding-up-panel";
import BottomSheetHandle from "../../../Components/BottomSheetHandle";
import { ListItem } from "../../../Components/List";
import { filterLibrary } from "../../../redux/library/library.actions";

const LibraryFilterSheet = ({
    bottomSheetRef,
    dispatch,
    sort,
    filter,
    theme,
}) => {
    const [animatedValue] = useState(new Animated.Value(0));

    return (
        <Bottomsheet
            animatedValue={animatedValue}
            ref={bottomSheetRef}
            draggableRange={{ top: 540, bottom: 0 }}
            snappingPoints={[0, 540]}
        >
            <View
                style={[
                    styles.contentContainer,
                    { backgroundColor: theme.colorPrimary },
                ]}
            >
                <BottomSheetHandle theme={theme} />
                <View style={{ marginTop: 24 }}>
                    <Text
                        style={{
                            color: theme.colorAccent,
                            paddingHorizontal: 16,
                            paddingBottom: 8,
                            textTransform: "uppercase",
                        }}
                    >
                        SORT
                    </Text>
                    <ListItem
                        title="Date Added"
                        theme={theme}
                        right={
                            sort === "novels.novelId ASC"
                                ? "arrow-up"
                                : sort === "novels.novelId DESC"
                                ? "arrow-down"
                                : null
                        }
                        onPress={() =>
                            sort === "novels.novelId ASC"
                                ? dispatch(
                                      filterLibrary(
                                          "novels.novelId DESC",
                                          filter
                                      )
                                  )
                                : dispatch(
                                      filterLibrary(
                                          "novels.novelId ASC",
                                          filter
                                      )
                                  )
                        }
                    />
                    <ListItem
                        title="Alphabetically"
                        theme={theme}
                        right={
                            sort === "novels.novelName ASC"
                                ? "arrow-up"
                                : sort === "novels.novelName DESC"
                                ? "arrow-down"
                                : null
                        }
                        onPress={() =>
                            sort === "novels.novelName ASC"
                                ? dispatch(
                                      filterLibrary(
                                          "novels.novelName DESC",
                                          filter
                                      )
                                  )
                                : dispatch(
                                      filterLibrary(
                                          "novels.novelName ASC",
                                          filter
                                      )
                                  )
                        }
                    />
                    <ListItem
                        title="Unread"
                        theme={theme}
                        right={
                            sort === "novels.unread ASC"
                                ? "arrow-up"
                                : sort === "novels.unread DESC"
                                ? "arrow-down"
                                : null
                        }
                        onPress={() =>
                            sort === "novels.unread ASC"
                                ? dispatch(
                                      filterLibrary(
                                          "novels.unread DESC",
                                          filter
                                      )
                                  )
                                : dispatch(
                                      filterLibrary("novels.unread ASC", filter)
                                  )
                        }
                    />
                    <ListItem
                        title="Downloaded"
                        theme={theme}
                        right={
                            sort === "chaptersDownloaded ASC"
                                ? "arrow-up"
                                : sort === "chaptersDownloaded DESC"
                                ? "arrow-down"
                                : null
                        }
                        onPress={() =>
                            sort === "chaptersDownloaded ASC"
                                ? dispatch(
                                      filterLibrary(
                                          "chaptersDownloaded DESC",
                                          filter
                                      )
                                  )
                                : dispatch(
                                      filterLibrary(
                                          "chaptersDownloaded ASC",
                                          filter
                                      )
                                  )
                        }
                    />
                    <ListItem
                        title="Total Chapters"
                        theme={theme}
                        right={
                            sort === "chaptersUnread ASC"
                                ? "arrow-up"
                                : sort === "chaptersUnread DESC"
                                ? "arrow-down"
                                : null
                        }
                        onPress={() =>
                            sort === "chaptersUnread ASC"
                                ? dispatch(
                                      filterLibrary(
                                          "chaptersUnread DESC",
                                          filter
                                      )
                                  )
                                : dispatch(
                                      filterLibrary(
                                          "chaptersUnread ASC",
                                          filter
                                      )
                                  )
                        }
                    />
                </View>
                <View>
                    <Text
                        style={{
                            color: theme.colorAccent,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            textTransform: "uppercase",
                        }}
                    >
                        Filter
                    </Text>
                    <Checkbox.Item
                        label="Downloaded"
                        labelStyle={{ color: theme.textColorPrimary }}
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
                                      filterLibrary(
                                          sort,
                                          "chaptersDownloaded > 0"
                                      )
                                  )
                        }
                    />
                    <Checkbox.Item
                        label="Unread"
                        labelStyle={{ color: theme.textColorPrimary }}
                        color={theme.colorAccent}
                        uncheckedColor={theme.textColorHint}
                        status={
                            filter === "unread = 1" ? "checked" : "unchecked"
                        }
                        onPress={() =>
                            filter === "unread = 1"
                                ? dispatch(filterLibrary(sort, ""))
                                : dispatch(filterLibrary(sort, "unread = 1"))
                        }
                    />
                    <Checkbox.Item
                        label="Completed"
                        labelStyle={{ color: theme.textColorPrimary }}
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
                                      filterLibrary(
                                          sort,
                                          "chaptersUnread IS NULL"
                                      )
                                  )
                        }
                    />
                </View>
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
