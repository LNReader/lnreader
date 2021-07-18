import React from "react";
import { StyleSheet } from "react-native";

import { Portal, Modal } from "react-native-paper";

import { Checkbox } from "../../../components/Checkbox/Checkbox";

import { setAppSettings } from "../../../redux/settings/settings.actions";

const DisplayModeModal = ({
    theme,
    dispatch,
    displayMode,
    hideDisplayModal,
    displayModalVisible,
}) => {
    const displayModes = [
        { displayMode: 0, label: "Compact Grid" },
        { displayMode: 1, label: "Comfortable Grid" },
        { displayMode: 2, label: "List" },
    ];

    const renderCheckboxes = () => {
        return displayModes.map((mode) => (
            <Checkbox
                key={mode.displayMode}
                status={displayMode === mode.displayMode}
                onPress={() =>
                    dispatch(setAppSettings("displayMode", mode.displayMode))
                }
                label={mode.label}
                theme={theme}
            />
        ));
    };

    return (
        <Portal>
            <Modal
                visible={displayModalVisible}
                onDismiss={hideDisplayModal}
                contentContainerStyle={[
                    styles.containerStyle,
                    { backgroundColor: theme.colorPrimaryDark },
                ]}
            >
                {renderCheckboxes()}
            </Modal>
        </Portal>
    );
};

export default DisplayModeModal;

const styles = StyleSheet.create({
    containerStyle: {
        padding: 20,
        margin: 20,
        borderRadius: 6,
    },
});
