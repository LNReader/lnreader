import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, DialogTitle, Modal } from '@components';
import { RadioButton, RadioButtonGroup } from '@components/RadioButton';
import { useTheme } from '@hooks/persisted';
import { getString } from '@strings/translations';
import { UserListStatus } from '@services/Trackers';
import { STATUS_LABELS } from './constants';
import { TrackStatusDialogProps } from './types';

const SetTrackStatusDialog: React.FC<TrackStatusDialogProps> = ({
  trackItem,
  visible,
  onDismiss,
  onUpdateStatus,
}) => {
  const theme = useTheme();
  const [selectedStatus, setSelectedStatus] = useState(trackItem.status);

  useEffect(() => {
    if (visible) {
      setSelectedStatus(trackItem.status);
    }
  }, [visible, trackItem.status]);

  const handleSave = () => {
    onUpdateStatus(selectedStatus);
    onDismiss();
  };

  const handleValueChange = (value: string) => {
    setSelectedStatus(value as UserListStatus);
  };

  return (
    <Modal visible={visible} onDismiss={onDismiss}>
      <DialogTitle title="Status" />
      <RadioButtonGroup
        onValueChange={handleValueChange}
        value={selectedStatus}
      >
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <RadioButton key={key} value={key} label={label} theme={theme} />
        ))}
      </RadioButtonGroup>
      <View style={styles.buttonContainer}>
        <Button onPress={onDismiss}>{getString('common.cancel')}</Button>
        <Button onPress={handleSave}>{getString('common.save')}</Button>
      </View>
    </Modal>
  );
};

export default SetTrackStatusDialog;

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
});
