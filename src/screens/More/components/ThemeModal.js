import React from "react";
import { Pressable, StyleSheet, View, Text } from "react-native";

import { Portal, Modal } from "react-native-paper";

import { setAppTheme } from "../../../redux/settings/settings.actions";

const ThemeModal = ({ themeModalVisible, hidethemeModal, dispatch, theme }) => {
    const themes = [
        { id: 1, name: "Light" },
        { id: 7, name: "Strawberry Daiquiri" },
        { id: 2, name: "Dark" },
        { id: 3, name: "Midnight Dusk" },
        { id: 4, name: "Green Apple" },
        { id: 5, name: "Iris Blue" },
        { id: 0, name: "AMOLED Dark" },
        { id: 6, name: "AMOLED Hot Pink" },
    ];

    const ThemeItem = ({ item }) => (
        <View
            style={[
                {
                    borderRadius: 8,
                    overflow: "hidden",
                    marginVertical: 4,
                },
                theme.id === item.id && {
                    backgroundColor: theme.rippleColor,
                },
            ]}
        >
            <Pressable
                android_ripple={{
                    color: theme.rippleColor,
                }}
                style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    justifyContent: "space-between",
                }}
                onPress={() => dispatch(setAppTheme(item.id))}
            >
                <Text style={{ color: theme.textColorPrimary }}>
                    {item.name}
                </Text>
            </Pressable>
        </View>
    );

    const renderThemeCheckboxes = () =>
        themes.map((item) => <ThemeItem item={item} key={item.id} />);

    return (
        <Portal>
            <Modal
                visible={themeModalVisible}
                onDismiss={hidethemeModal}
                contentContainerStyle={[
                    styles.containerStyle,
                    { backgroundColor: theme.colorPrimaryDark },
                ]}
            >
                {renderThemeCheckboxes()}
            </Modal>
        </Portal>
    );
};

export default ThemeModal;

const styles = StyleSheet.create({
    containerStyle: {
        padding: 20,
        margin: 20,
        borderRadius: 6,
    },
});
