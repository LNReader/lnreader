import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Modal } from 'react-native-paper';
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
        { backgroundColor: theme.colorPrimary },
      ]}
    >
      <Text style={[styles.dialogTitle, { color: theme.textColorPrimary }]}>
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
    padding: 20,
    borderRadius: 8,
  },
  dialogTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
});
