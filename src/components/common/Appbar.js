import React, { useRef } from "react";
import { View, TextInput } from "react-native";
import {
    TouchableRipple,
    IconButton,
    Appbar as MaterialAppbar,
} from "react-native-paper";
import Constants from "expo-constants";

import { useSelector } from "react-redux";

export const Appbar = ({ title, onBackAction }) => {
    const theme = useSelector((state) => state.themeReducer.theme);

    return (
        <MaterialAppbar.Header
            style={{ backgroundColor: theme.colorDarkPrimary }}
        >
            {onBackAction && (
                <MaterialAppbar.BackAction onPress={onBackAction} />
            )}
            <MaterialAppbar.Content
                title={title}
                titleStyle={{ color: theme.textColorPrimaryDark }}
            />
        </MaterialAppbar.Header>
    );
};

export const SearchAppbar = ({
    searchLibraryNovels,
    setSearchText,
    searchText,
    getLibraryNovels,
}) => {
    const searchRef = useRef(null);

    const theme = useSelector((state) => state.themeReducer.theme);

    return (
        <TouchableRipple
            borderless
            onPress={() => searchRef.current.focus()}
            style={{
                marginTop: Constants.statusBarHeight + 4,
                height: 50,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                marginBottom: 8,
                borderRadius: 8,
                backgroundColor: theme.searchBarColor,
                marginHorizontal: 12,
                elevation: 2,
            }}
        >
            <View
                style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "space-between",
                }}
            >
                <View style={{ flex: 1, flexDirection: "row" }}>
                    <IconButton
                        icon="magnify"
                        color={theme.textColorSecondaryDark}
                        style={{ marginLeft: 0 }}
                        size={23}
                    />
                    <TextInput
                        ref={searchRef}
                        style={{
                            fontSize: 16,
                            color: theme.textColorSecondaryDark,
                        }}
                        placeholder="Search Library"
                        placeholderTextColor={theme.textColorSecondaryDark}
                        onChangeText={(text) => {
                            setSearchText(text);
                            searchLibraryNovels(text);
                        }}
                        defaultValue={searchText}
                    />
                </View>
                {searchText !== "" && (
                    <IconButton
                        icon="close"
                        color={theme.textColorSecondaryDark}
                        style={{ marginRight: 0 }}
                        size={23}
                        onPress={() => {
                            getLibraryNovels();
                            setSearchText("");
                        }}
                    />
                )}
                <IconButton
                    icon="filter-variant"
                    color={theme.textColorSecondaryDark}
                    style={{ marginRight: 0 }}
                    size={23}
                    disabled
                    /**
                     * TODO
                     */
                    onPress={() => console.log("Filter Button Pressed")}
                />
            </View>
        </TouchableRipple>
    );
};
