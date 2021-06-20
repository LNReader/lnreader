import React, { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { Modal, Portal, TextInput } from "react-native-paper";

const AccentColorModal = ({
    accentColorModal,
    hideAccentColorModal,
    theme,
    onPress,
    color,
}) => {
    const [text, setText] = useState(color);
    const [error, setError] = useState();

    return (
        <Portal>
            <Modal
                visible={accentColorModal}
                onDismiss={() => {
                    hideAccentColorModal();
                    setText();
                    setError();
                }}
                contentContainerStyle={[
                    styles.containerStyle,
                    { backgroundColor: theme.colorPrimary },
                ]}
            >
                <Text
                    style={[
                        styles.dialogTitle,
                        { color: theme.textColorPrimary },
                    ]}
                >
                    Hex Color Code
                </Text>
                <TextInput
                    value={text}
                    defaultValue={color}
                    onChangeText={(text) => setText(text)}
                    onSubmitEditing={() => {
                        if (text.match(/^#([0-9a-f]{6}|[0-9a-f]{3})$/i)) {
                            onPress(text);
                            hideAccentColorModal();
                        } else {
                            setError("Enter a valid hex color code");
                        }
                    }}
                    mode="outlined"
                    theme={{
                        colors: {
                            primary: color,
                            placeholder: theme.textColorHint,
                            text: theme.textColorPrimary,
                            background: "transparent",
                        },
                    }}
                    underlineColor={theme.textColorHint}
                    dense
                    error={error}
                />
                <Text style={{ color: "#FF0033", paddingTop: 8 }}>{error}</Text>
            </Modal>
        </Portal>
    );
};

export default AccentColorModal;

const styles = StyleSheet.create({
    containerStyle: {
        margin: 30,
        padding: 20,
        borderRadius: 8,
    },
    dialogTitle: {
        fontSize: 18,
        marginBottom: 16,
    },
});
