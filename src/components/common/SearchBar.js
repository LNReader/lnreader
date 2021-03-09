import React from "react";
import { TextInput, StyleSheet } from "react-native";
import { theme } from "../../theme/theme";

const SearchBar = ({ searchText, onChangeText, onSubmitEditing }) => (
    <TextInput
        autoFocus
        placeholder="Search..."
        defaultValue={searchText}
        style={styles.searchBar}
        placeholderTextColor={theme.textColorHintDark}
        blurOnSubmit={true}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
    />
);

export default SearchBar;

const styles = StyleSheet.create({
    searchBar: {
        flex: 1,
        fontSize: 18,
        color: "white",
        marginLeft: 15,
    },
});
