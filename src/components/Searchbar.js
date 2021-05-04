import React, { useRef } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { TouchableRipple, IconButton } from "react-native-paper";
import Constants from "expo-constants";

export const Searchbar = ({
    theme,
    placeholder,
    searchText,
    left,
    onPressLeft,
    right,
    menu,
    onPressRight,
    clearSearchbar,
    onChangeText,
    onSubmitEditing,
}) => {
    const searchRef = useRef(null);

    return (
        <TouchableRipple
            borderless
            onPress={() => searchRef.current.focus()}
            style={[
                styles.searchAppbarContainer,
                { backgroundColor: theme.searchBarColor },
            ]}
            rippleColor={theme.rippleColor}
        >
            <View style={styles.container}>
                <View style={{ flex: 1, flexDirection: "row" }}>
                    {left && (
                        <IconButton
                            icon={left}
                            color={theme.textColorSecondary}
                            style={{ marginLeft: 0 }}
                            size={23}
                            onPress={onPressLeft}
                        />
                    )}
                    <TextInput
                        ref={searchRef}
                        style={{
                            fontSize: 16,
                            color: theme.textColorSecondary,
                        }}
                        placeholder={placeholder}
                        placeholderTextColor={theme.textColorSecondary}
                        onChangeText={onChangeText}
                        onSubmitEditing={onSubmitEditing}
                        defaultValue={searchText}
                    />
                </View>
                {searchText !== "" && (
                    <IconButton
                        icon="close"
                        color={theme.textColorSecondary}
                        style={{ marginRight: 0 }}
                        size={23}
                        onPress={clearSearchbar}
                    />
                )}
                {right && (
                    <IconButton
                        icon="earth"
                        color={theme.textColorSecondary}
                        style={{ marginRight: 0 }}
                        size={23}
                        onPress={onPressRight}
                    />
                )}
            </View>
        </TouchableRipple>
    );
};

const styles = StyleSheet.create({
    searchAppbarContainer: {
        marginTop: Constants.statusBarHeight + 8,
        height: 48,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        marginBottom: 12,
        borderRadius: 8,
        marginHorizontal: 12,
        elevation: 2,
    },
    container: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
    },
});
