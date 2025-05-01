import React from 'react';
import { StyleSheet, Text } from 'react-native';
import {
  RadioButton,
  RadioButtonGroup,
} from '../../../../components/RadioButton';
import { Modal } from '@components';

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
  dialogTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
});
