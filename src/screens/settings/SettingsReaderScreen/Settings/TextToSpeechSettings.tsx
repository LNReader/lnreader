import { List } from '@components';
import { useChapterReaderSettings, useTheme } from '@hooks/persisted';
import React from 'react';
import VoicePickerModal from '../Modals/VoicePickerModal';
import { useBoolean } from '@hooks';
import { Portal } from 'react-native-paper';

export default function TextToSpeechSettings() {
  const theme = useTheme();
  const { tts } = useChapterReaderSettings();
  const {
    value: voiceModalVisible,
    setTrue: showVoiceModal,
    setFalse: hideVoiceModal,
  } = useBoolean();
  return (
    <>
      <List.SubHeader theme={theme}>Text to Speech</List.SubHeader>
      <List.Item
        title={'TTS voice'}
        description={tts?.voice?.name || 'System'}
        onPress={showVoiceModal}
        theme={theme}
      />
      <Portal>
        <VoicePickerModal
          visible={voiceModalVisible}
          onDismiss={hideVoiceModal}
        />
      </Portal>
    </>
  );
}
