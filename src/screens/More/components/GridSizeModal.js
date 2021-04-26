import React from "react";
import { Text, StyleSheet } from "react-native";
import { Portal, Modal } from "react-native-paper";
import Slider from "@react-native-community/slider";

const GridSizeModal = ({
    itemsPerRow,
    gridSizeModalVisible,
    hideGridSizeModal,
    setItemsPerRow,
    theme,
}) => {
    return (
        <Portal>
            <Modal
                visible={gridSizeModalVisible}
                onDismiss={hideGridSizeModal}
                contentContainerStyle={[
                    styles.containerStyle,
                    { backgroundColor: theme.colorPrimaryDark },
                ]}
            >
                <Text
                    style={[
                        styles.modalHeader,
                        { color: theme.textColorPrimary },
                    ]}
                >
                    Grid size
                </Text>
                <Text
                    style={[
                        styles.modalDescription,
                        { color: theme.textColorSecondary },
                    ]}
                >
                    {`${itemsPerRow} per row`}
                </Text>
                <Slider
                    style={styles.slider}
                    value={itemsPerRow}
                    minimumValue={1}
                    maximumValue={5}
                    step={1}
                    minimumTrackTintColor={theme.colorAccentDark}
                    maximumTrackTintColor="#000000"
                    thumbTintColor={theme.colorAccentDark}
                    onValueChange={(value) => setItemsPerRow(value)}
                />
            </Modal>
        </Portal>
    );
};

export default GridSizeModal;

const styles = StyleSheet.create({
    containerStyle: {
        padding: 20,
        margin: 20,
        borderRadius: 6,
    },
    modalHeader: {
        fontSize: 18,
        marginBottom: 10,
    },
    modalDescription: {
        marginBottom: 4,
    },
    slider: {
        width: "100%",
        height: 40,
    },
});
