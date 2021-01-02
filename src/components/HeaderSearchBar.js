import React from "react";
import { TextInput } from "react-native";
import { theme } from "../theming/theme";

const HeaderSearchBar = ({ searchText, onChangeText, onSubmitEditing }) => (
    <TextInput
        placeholder="Search..."
        defaultValue={searchText}
        style={{
            fontSize: 18,
            flex: 1,
            color: "white",
            marginLeft: 15,
        }}
        autoFocus
        placeholderTextColor={theme.textColorHintDark}
        blurOnSubmit={true}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
    />
);

export default HeaderSearchBar;
