import React, { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { Modal, TextInput } from "react-native-paper";
import {
    RadioButton,
    RadioButtonGroup,
} from "../../../../Components/RadioButton";

const SetTrackChaptersDialog = ({
    trackItem,
    trackChaptersDialog,
    setTrackChaptersDialog,
    updateTrackChapters,
    theme,
}) => {
    const [trackChapters, setTrackChapters] = useState(
        trackItem.my_list_status.num_chapters_read
    );

    return (
        <Modal
            visible={trackChaptersDialog}
            onDismiss={() => setTrackChaptersDialog(false)}
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
                value={trackChapters.toString()}
                onChangeText={(text) => setTrackChapters(text ? +text : "")}
                onSubmitEditing={() => updateTrackChapters(trackChapters)}
                mode="outlined"
                keyboardType="numeric"
                theme={{
                    colors: {
                        primary: theme.colorAccentDark,
                        placeholder: theme.textColorHintDark,
                        text: theme.textColorPrimary,
                        background: "transparent",
                    },
                }}
                underlineColor={theme.textColorHintDark}
                dense
            />
        </Modal>
    );
};

export default SetTrackChaptersDialog;

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
