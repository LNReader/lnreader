import React, { useState } from "react";
import { StyleSheet, Text } from "react-native";

import { Modal, Portal, TextInput } from "react-native-paper";

const ColorPickerModal = ({
    theme,
    color,
    title,
    onSubmit,
    hideModal,
    modalVisible,
    showAccentColors,
}) => {
    const [text, setText] = useState(color);
    const [error, setError] = useState();

    const onDismiss = () => {
        hideModal();
        setText();
        setError();
    };

    const onChangeText = (text) => setText(text);

    const onSubmitEditing = () => {
        const re = /^#([0-9a-f]{6}|[0-9a-f]{3})$/i;

        if (text.match(re)) {
            onSubmit(text);
            hideModal();
        } else {
            setError("Enter a valid hex color code");
        }
    };

    const textInputTheme = {
        colors: {
            primary: color,
            placeholder: theme.textColorHint,
            text: theme.textColorPrimary,
            background: "transparent",
        },
    };

    return (
        <Portal>
            <Modal
                visible={modalVisible}
                onDismiss={onDismiss}
                contentContainerStyle={[
                    styles.modalContainer,
                    { backgroundColor: theme.colorPrimary },
                ]}
            >
                <Text
                    style={[
                        styles.modalTitle,
                        { color: theme.textColorPrimary },
                    ]}
                >
                    {title}
                </Text>
                <TextInput
                    value={text}
                    defaultValue={color}
                    placeholder="Hex Color Code (E.g. #3399FF)"
                    onChangeText={onChangeText}
                    onSubmitEditing={onSubmitEditing}
                    mode="outlined"
                    theme={textInputTheme}
                    underlineColor={theme.textColorHint}
                    dense
                    error={error}
                />
                <Text style={styles.errorText}>{error}</Text>
            </Modal>
        </Portal>
    );
};

export default ColorPickerModal;

const styles = StyleSheet.create({
    modalContainer: {
        margin: 30,
        padding: 20,
        borderRadius: 8,
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 16,
    },
    errorText: {
        color: "#FF0033",
        paddingTop: 8,
    },
});
