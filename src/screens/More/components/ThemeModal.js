import React from "react";
import { Pressable, StyleSheet, View, Text } from "react-native";
import { Portal, Modal, Checkbox } from "react-native-paper";

import { setStatusBarStyle } from "expo-status-bar";
import { setAppTheme } from "../../../redux/settings/settings.actions";
import ImmersiveMode from "react-native-immersive-mode";

const ThemeModal = ({ themeModalVisible, hidethemeModal, dispatch, theme }) => {
    const themes = [
        { id: 1, name: "Light", statusBar: "dark" },
        { id: 7, name: "Strawberry Daiquiri", statusBar: "dark" },
        { id: 2, name: "Dark", statusBar: "light" },
        { id: 3, name: "Midnight Dusk", statusBar: "light" },
        { id: 4, name: "Green Apple", statusBar: "light" },
        { id: 5, name: "Iris Blue", statusBar: "light" },
        { id: 0, name: "AMOLED Dark", statusBar: "light" },
        { id: 6, name: "AMOLED Hot Pink", statusBar: "light" },
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
                onPress={() => {
                    dispatch(setAppTheme(item.id));
                    setStatusBarStyle(item.statusBar);
                    ImmersiveMode.setBarColor(item.colorPrimary);
                }}
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
