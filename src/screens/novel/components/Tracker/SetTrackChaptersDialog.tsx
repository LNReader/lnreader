import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-paper';

import { Button, DialogTitle, Modal } from '@components';
import { useTheme } from '@hooks/persisted';
import { getString } from '@strings/translations';
import { TrackChaptersDialogProps } from './types';

const SetTrackChaptersDialog: React.FC<TrackChaptersDialogProps> = ({
  trackItem,
  visible,
  onDismiss,
  onUpdateChapters,
}) => {
  const theme = useTheme();
  const [chapters, setChapters] = useState(trackItem.progress.toString());

  useEffect(() => {
    if (visible) {
      setChapters(trackItem.progress.toString());
    }
  }, [visible, trackItem.progress]);

  const handleSave = () => {
    onUpdateChapters(chapters);
  };

  const handleChangeText = (text: string) => {
    setChapters(text ? text : '');
  };

  return (
    <Modal visible={visible} onDismiss={onDismiss}>
      <DialogTitle title="Chapters" />
      <TextInput
        value={chapters}
        onChangeText={handleChangeText}
        mode="outlined"
        keyboardType="numeric"
        theme={{
          colors: {
            primary: theme.primary,
            placeholder: theme.outline,
            text: theme.onSurface,
            background: 'transparent',
          },
        }}
        underlineColor={theme.outline}
      />
      <View style={styles.buttonContainer}>
        <Button onPress={onDismiss}>{getString('common.cancel')}</Button>
        <Button onPress={handleSave}>{getString('common.save')}</Button>
      </View>
    </Modal>
  );
};

export default SetTrackChaptersDialog;

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
});
