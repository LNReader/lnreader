import React from "react";
import { TextInput } from "react-native";
import { Appbar } from "react-native-paper";

import { useSelector } from "react-redux";

const LibraryAppbar = ({
    searchBar,
    setSearchBar,
    searchText,
    setSearchText,
    getLibraryNovels,
    searchLibraryNovels,
}) => {
    const theme = useSelector((state) => state.themeReducer.theme);

    return (
        <Appbar.Header style={{ backgroundColor: theme.colorDarkPrimary }}>
            {!searchBar ? (
                <>
                    <Appbar.Content
                        title="Library"
                        titleStyle={{ color: theme.textColorPrimaryDark }}
                    />
                    <Appbar.Action
                        icon="magnify"
                        onPress={() => setSearchBar(true)}
                        color={theme.textColorPrimaryDark}
                    />
                    <Appbar.Action
                        color={theme.textColorPrimaryDark}
                        icon="filter-variant"
                        disabled
                        // onPress={() => _panel.show({ velocity: -1.5 })}
                    />
                </>
            ) : (
                <>
                    <Appbar.BackAction
                        onPress={() => {
                            setSearchBar(false);
                            setSearchText("");
                            getLibraryNovels();
                        }}
                        color={theme.textColorPrimaryDark}
                        size={24}
                    />
                    <TextInput
                        placeholder="Search..."
                        defaultValue={searchText}
                        style={{
                            fontSize: 18,
                            flex: 1,
                            color: theme.textColorPrimaryDark,
                            marginLeft: 15,
                        }}
                        autoFocus
                        placeholderTextColor={theme.textColorHintDark}
                        blurOnSubmit={true}
                        onChangeText={(text) => {
                            setSearchText(text);
                            searchLibraryNovels(text);
                        }}
                    />
                    {searchText !== "" && (
                        <Appbar.Action
                            icon="close"
                            onPress={() => {
                                setSearchText("");
                                getLibraryNovels();
                            }}
                            color={theme.textColorPrimaryDark}
                        />
                    )}
                </>
            )}
        </Appbar.Header>
    );
};

export default LibraryAppbar;
