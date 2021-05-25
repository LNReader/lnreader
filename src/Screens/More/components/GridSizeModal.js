import React from "react";
import { Text, StyleSheet } from "react-native";
import { Portal, Modal } from "react-native-paper";
import Slider from "@react-native-community/slider";
import { RadioButton, RadioButtonGroup } from "../../../Components/RadioButton";
import { setNovelsPerRow } from "../../../redux/settings/settings.actions";

const GridSizeModal = ({
    dispatch,
    novelsPerRow,
    gridSizeModalVisible,
    hideGridSizeModal,
    theme,
}) => {
    const gridSizes = {
        5: "XS",
        4: "S",
        3: "M",
        2: "L",
        1: "XL",
    };

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
                    {`${novelsPerRow} per row`}
                </Text>
                {/* <Slider
                    style={styles.slider}
                    value={novelsPerRow}
                    minimumValue={1}
                    maximumValue={5}
                    step={1}
                    minimumTrackTintColor={theme.colorAccent}
                    maximumTrackTintColor="#000000"
                    thumbTintColor={theme.colorAccent}
                    onValueChange={(value) => dispatch(setNovelsPerRow(value))}
                /> */}
                <RadioButtonGroup
                    onValueChange={(value) => dispatch(setNovelsPerRow(value))}
                    value={novelsPerRow}
                >
                    {Object.keys(gridSizes).map((item) => (
                        <RadioButton
                            key={item}
                            value={item}
                            label={gridSizes[item]}
                            theme={theme}
                        />
                    ))}
                </RadioButtonGroup>
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
        marginBottom: 16,
    },
    slider: {
        width: "100%",
        height: 40,
    },
});
