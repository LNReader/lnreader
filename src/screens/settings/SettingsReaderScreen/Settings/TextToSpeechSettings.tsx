import { Button, List } from '@components';
import { useChapterReaderSettings, useTheme } from '@hooks/persisted';
import React, { useEffect, useState } from 'react';
import VoicePickerModal from '../Modals/VoicePickerModal';
import { useBoolean } from '@hooks';
import { Portal } from 'react-native-paper';
import { StyleSheet, View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { getAvailableVoicesAsync, Voice } from 'expo-speech';

export default function TextToSpeechSettings() {
  const theme = useTheme();
  const [voices, setVoices] = useState<Voice[]>([]);
  useEffect(() => {
    getAvailableVoicesAsync().then(res => {
      res.sort((a, b) => a.name.localeCompare(b.name));
      setVoices([{ name: 'System', language: 'System' } as Voice, ...res]);
    });
  }, []);

  const { tts, setChapterReaderSettings } = useChapterReaderSettings();
  const {
    value: voiceModalVisible,
    setTrue: showVoiceModal,
    setFalse: hideVoiceModal,
  } = useBoolean();
  return (
    <>
      <View style={styles.row}>
        <List.SubHeader theme={theme}>Text to Speech</List.SubHeader>
        <Button
          mode="text"
          onPress={() => {
            setChapterReaderSettings({
              tts: {
                pitch: 1,
                rate: 1,
                voice: { name: 'System', language: 'System' } as Voice,
              },
            });
          }}
          title="Reset"
          icon="reload"
        />
      </View>
      <List.Item
        title={'TTS voice'}
        description={tts?.voice?.name || 'System'}
        onPress={showVoiceModal}
        theme={theme}
      />
      <List.Section>
        <Text style={[styles.label, { color: theme.onSurface }]}>
          Voice rate
        </Text>
        <Slider
          style={styles.slider}
          value={tts?.rate}
          minimumValue={0.1}
          maximumValue={5}
          step={0.1}
          minimumTrackTintColor={theme.primary}
          maximumTrackTintColor={theme.surfaceVariant}
          thumbTintColor={theme.primary}
          onSlidingComplete={value =>
            setChapterReaderSettings({ tts: { ...tts, rate: value } })
          }
        />
        <Text style={[styles.label, { color: theme.onSurface }]}>
          Voice pitch
        </Text>
        <Slider
          style={styles.slider}
          value={tts?.pitch}
          minimumValue={0.1}
          maximumValue={5}
          step={0.1}
          minimumTrackTintColor={theme.primary}
          maximumTrackTintColor={theme.surfaceVariant}
          thumbTintColor={theme.primary}
          onSlidingComplete={value =>
            setChapterReaderSettings({ tts: { ...tts, pitch: value } })
          }
        />
      </List.Section>
      <View style={{ height: 16 }} />
      <Portal>
        <VoicePickerModal
          visible={voiceModalVisible}
          onDismiss={hideVoiceModal}
          voices={voices}
        />
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    textAlign: 'center',
    fontSize: 16,
  },
  slider: {
    flex: 1,
    height: 40,
  },
});
