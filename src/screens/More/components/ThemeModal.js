import React from "react";
import { StyleSheet } from "react-native";

import { Portal, Modal } from "react-native-paper";
import { Checkbox } from "../../../components/Checkbox/Checkbox";

import { setAppTheme } from "../../../redux/settings/settings.actions";

const ThemeModal = ({ themeModalVisible, hidethemeModal, dispatch, theme }) => {
    const themes = [
        { id: 1, name: "Light" },
        { id: 10, name: "Spring Blossom" },
        { id: 2, name: "Dark" },
        { id: 3, name: "Midnight Dusk" },
        { id: 4, name: "Green Apple" },
        { id: 5, name: "Iris Blue" },
        { id: 7, name: "Strawberry Daiquiri" },
        { id: 8, name: "Tako" },
        { id: 9, name: "Yin & Yang" },
    ];

    const renderThemeCheckboxes = () =>
        themes.map((item) => (
            <Checkbox
                key={item.id}
                status={theme.id === item.id}
                label={item.name}
                onPress={() => dispatch(setAppTheme(item.id))}
                theme={theme}
            />
        ));

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
