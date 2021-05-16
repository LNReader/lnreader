import React, { useRef } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { TouchableRipple, IconButton } from "react-native-paper";
import Constants from "expo-constants";
import { useSettings } from "../Hooks/reduxHooks";
import { useDispatch } from "react-redux";
import { setAppSettings } from "../redux/settings/settings.actions";

export const Searchbar = ({
    theme,
    placeholder,
    searchText,
    left,
    onPressLeft,
    right,
    displayMenu,
    onPressRight,
    clearSearchbar,
    onChangeText,
    onSubmitEditing,
    migrate,
    onPressMigrate,
    filter,
}) => {
    const searchRef = useRef(null);
    const dispatch = useDispatch();
    const { displayMode } = useSettings();

    const displayMenuIcon = () => {
        const icons = {
            0: "view-module",
            1: "view-list",
            2: "view-module",
        };

        return icons[displayMode];
    };

    const getDisplayMode = () =>
        displayMode === 0 ? 1 : displayMode === 1 ? 2 : displayMode === 2 && 0;

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
                {displayMenu && (
                    <IconButton
                        icon={displayMenuIcon()}
                        color={theme.textColorSecondary}
                        style={{ marginRight: 0 }}
                        size={23}
                        onPress={() =>
                            dispatch(
                                setAppSettings("displayMode", getDisplayMode())
                            )
                        }
                    />
                )}
                {right && (
                    <IconButton
                        icon={right}
                        color={
                            !filter
                                ? theme.textColorSecondary
                                : theme.filterColor
                        }
                        style={{ marginRight: 0 }}
                        size={23}
                        onPress={onPressRight}
                    />
                )}
                {migrate && (
                    <IconButton
                        icon={migrate}
                        color={theme.textColorSecondary}
                        style={{ marginRight: 0 }}
                        size={23}
                        onPress={onPressMigrate}
                    />
                )}
            </View>
        </TouchableRipple>
    );
};

const styles = StyleSheet.create({
    searchAppbarContainer: {
        marginTop: Constants.statusBarHeight + 4,
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
