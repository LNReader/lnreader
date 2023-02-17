import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Modal, overlay } from 'react-native-paper';
import {
  RadioButton,
  RadioButtonGroup,
} from '../../../../components/RadioButton';

const SetTrackStatusDialog = ({
  trackItem,
  trackStatusDialog,
  setTrackStatusDialog,
  updateTrackStatus,
  theme,
}) => {
  const myAnimeListStatus = {
    reading: 'Reading',
    completed: 'Completed',
    on_hold: 'On Hold',
    dropped: 'Dropped',
    plan_to_read: 'Plan to read',
  };

  return (
    <Modal
      visible={trackStatusDialog}
      onDismiss={() => setTrackStatusDialog(false)}
      contentContainerStyle={[
        styles.containerStyle,
        { backgroundColor: overlay(2, theme.surface) },
      ]}
    >
      <Text style={[styles.dialogTitle, { color: theme.onSurface }]}>
        Status
      </Text>
      <RadioButtonGroup
        onValueChange={updateTrackStatus}
        value={trackItem.my_list_status.status}
      >
        {Object.keys(myAnimeListStatus).map((key, index) => (
          <RadioButton
            key={index}
            value={key}
            label={myAnimeListStatus[key]}
            theme={theme}
          />
        ))}
      </RadioButtonGroup>
    </Modal>
  );
};

export default SetTrackStatusDialog;

const styles = StyleSheet.create({
  containerStyle: {
    margin: 30,
    padding: 24,
    borderRadius: 28,
  },
  dialogTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
});
