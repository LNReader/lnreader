import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Modal, overlay, TextInput } from 'react-native-paper';

const SetTrackChaptersDialog = ({
  trackItem,
  trackChaptersDialog,
  setTrackChaptersDialog,
  updateTrackChapters,
  theme,
}) => {
  const [trackChapters, setTrackChapters] = useState(
    trackItem.my_list_status.num_chapters_read,
  );

  return (
    <Modal
      visible={trackChaptersDialog}
      onDismiss={() => setTrackChaptersDialog(false)}
      contentContainerStyle={[
        styles.containerStyle,
        { backgroundColor: overlay(2, theme.surface) },
      ]}
    >
      <Text style={[styles.dialogTitle, { color: theme.textColorPrimary }]}>
        Chapters
      </Text>
      <TextInput
        value={trackChapters.toString()}
        onChangeText={text => setTrackChapters(text ? +text : '')}
        onSubmitEditing={() => updateTrackChapters(trackChapters)}
        mode="outlined"
        keyboardType="numeric"
        theme={{
          colors: {
            primary: theme.primary,
            placeholder: theme.textColorHint,
            text: theme.textColorPrimary,
            background: 'transparent',
          },
        }}
        underlineColor={theme.textColorHint}
      />
    </Modal>
  );
};

export default SetTrackChaptersDialog;

const styles = StyleSheet.create({
  containerStyle: {
    margin: 30,
    padding: 24,
    borderRadius: 28,
    paddingBottom: 36,
  },
  dialogTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
});
