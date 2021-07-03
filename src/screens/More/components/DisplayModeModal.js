import React from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { Portal, Modal, Checkbox } from "react-native-paper";
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
            <View
                key={mode.displayMode}
                style={[
                    {
                        borderRadius: 8,
                        overflow: "hidden",
                        marginVertical: 4,
                    },
                    displayMode === mode.displayMode && {
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
                    onPress={() =>
                        dispatch(
                            setAppSettings("displayMode", mode.displayMode)
                        )
                    }
                >
                    <Text style={{ color: theme.textColorPrimary }}>
                        {mode.label}
                    </Text>
                </Pressable>
            </View>
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
