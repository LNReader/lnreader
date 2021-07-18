import React, { useRef } from "react";
import { StyleSheet, View, TextInput, Text, StatusBar } from "react-native";

import { TouchableRipple, IconButton } from "react-native-paper";
import { Row } from "../Common";

export const Searchbar = ({
    theme,
    placeholder,
    searchText,
    backAction,
    onBackAction,
    clearSearchbar,
    onChangeText,
    onSubmitEditing,
    actions,
}) => {
    const searchRef = useRef(null);

    return (
        <TouchableRipple
            borderless
            onPress={() => searchRef.current.focus()}
            style={[
                styles.searchbarContainer,
                { backgroundColor: theme.searchBarColor },
            ]}
            rippleColor={theme.rippleColor}
        >
            <View style={styles.container}>
                <Row style={{ flex: 1 }}>
                    {backAction && (
                        <IconButton
                            icon={backAction}
                            color={theme.textColorSecondary}
                            style={{ marginLeft: 0 }}
                            size={23}
                            onPress={onBackAction}
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
                </Row>
                {searchText !== "" && (
                    <IconButton
                        icon="close"
                        color={theme.textColorSecondary}
                        style={{ marginRight: 0 }}
                        size={23}
                        onPress={clearSearchbar}
                    />
                )}
                {actions &&
                    actions.map((action, index) => (
                        <IconButton
                            key={index}
                            icon={action.icon}
                            color={action.color ?? theme.textColorSecondary}
                            style={{ marginRight: 0 }}
                            size={23}
                            onPress={action.onPress}
                        />
                    ))}
            </View>
        </TouchableRipple>
    );
};

const styles = StyleSheet.create({
    searchbarContainer: {
        marginTop: StatusBar.currentHeight + 4,
        height: 48,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        marginBottom: 8,
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
