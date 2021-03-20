import React from "react";
import { StyleSheet, TextInput } from "react-native";
import { Appbar } from "react-native-paper";

import { useSelector } from "react-redux";

const LibraryAppbar = ({
    search,
    setSearch,
    getLibraryNovels,
    searchLibraryNovels,
}) => {
    const theme = useSelector((state) => state.themeReducer.theme);

    const { searching, searchText } = search;

    return (
        <Appbar.Header style={{ backgroundColor: theme.colorPrimary }}>
            {!searching ? (
                <>
                    <Appbar.Content
                        title="Library"
                        titleStyle={{ color: theme.textColorPrimary }}
                    />
                    <Appbar.Action
                        icon="magnify"
                        onPress={() =>
                            setSearch({ ...search, searching: true })
                        }
                        color={theme.textColorPrimary}
                    />
                    <Appbar.Action
                        color={theme.textColorPrimary}
                        icon="filter-variant"
                        disabled
                        // onPress={() => _panel.show({ velocity: -1.5 })}
                    />
                </>
            ) : (
                <>
                    <Appbar.BackAction
                        onPress={() => {
                            setSearch({ searching: false, searchText: "" });
                            getLibraryNovels();
                        }}
                        color={theme.textColorPrimary}
                        size={24}
                    />
                    <TextInput
                        placeholder="Search..."
                        defaultValue={searchText}
                        style={[
                            styles.searchBar,
                            {
                                color: theme.textColorPrimary,
                            },
                        ]}
                        autoFocus
                        placeholderTextColor={theme.textColorHintDark}
                        blurOnSubmit={true}
                        onChangeText={(text) => {
                            setSearch({ ...search, searchText: text });
                            searchLibraryNovels(text);
                        }}
                    />
                    {searchText !== "" && (
                        <Appbar.Action
                            icon="close"
                            onPress={() => {
                                setSearch({ ...search, searchText: "" });
                                getLibraryNovels();
                            }}
                            color={theme.textColorPrimary}
                        />
                    )}
                </>
            )}
        </Appbar.Header>
    );
};

export default LibraryAppbar;

const styles = StyleSheet.create({
    searchBar: { fontSize: 18, flex: 1, marginLeft: 15 },
});
