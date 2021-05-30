import React, { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { Modal, TextInput } from "react-native-paper";
import { setAccentColor } from "../../../redux/settings/settings.actions";

const AccentColorModal = ({
    dispatch,
    accentColorModal,
    hideAccentColorModal,
    theme,
}) => {
    const [text, setText] = useState(theme.colorAccent);
    const [error, setError] = useState();

    return (
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
                style={[styles.dialogTitle, { color: theme.textColorPrimary }]}
            >
                Chapters
            </Text>
            <TextInput
                value={text}
                defaultValue={theme.colorAccent}
                onChangeText={(text) => setText(text)}
                onSubmitEditing={() => {
                    if (text.match(/^#[0-9a-f]{3,6}$/i)) {
                        dispatch(setAccentColor(text));
                        hideAccentColorModal();
                    } else {
                        setError("Enter a valid hex color code");
                    }
                }}
                mode="outlined"
                theme={{
                    colors: {
                        primary: theme.colorAccent,
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
