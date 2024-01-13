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
  /** @type {Record<import("../../../../services/Trackers/index").UserListStatus, string>} */
  const statusTypes = {
    CURRENT: 'Reading',
    PLANNING: 'Plan to read',
    COMPLETED: 'Completed',
    DROPPED: 'Dropped',
    PAUSED: 'On Hold',
    REPEATING: 'Rereading',
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
        value={trackItem.status}
      >
        {Object.keys(statusTypes).map((key, index) => (
          <RadioButton
            key={index}
            value={key}
            label={statusTypes[key]}
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
