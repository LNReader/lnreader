import { IconButtonV2, List } from '@components';
import {
  useChapterGeneralSettings,
  useChapterReaderSettings,
} from '@hooks/persisted';
import { useTheme } from '@providers/ThemeProvider';
import React, { useEffect, useState } from 'react';
import VoicePickerModal from '../Modals/VoicePickerModal';
import { useBoolean } from '@hooks';
import { Portal } from 'react-native-paper';
import { StyleSheet, View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { getAvailableVoicesAsync, Voice } from 'expo-speech';
import Switch from '@components/Switch/Switch';

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
  const { TTSEnable = true, setChapterGeneralSettings } =
    useChapterGeneralSettings();
  const {
    value: voiceModalVisible,
    setTrue: showVoiceModal,
    setFalse: hideVoiceModal,
  } = useBoolean();
  return (
    <>
      <View style={styles.row}>
        <List.SubHeader theme={theme}>Text to Speech</List.SubHeader>
        <View style={styles.row}>
          <Switch
            value={TTSEnable}
            onValueChange={() => {
              setChapterGeneralSettings({
                TTSEnable: !TTSEnable,
              });
            }}
          />
          <IconButtonV2
            name="reload"
            theme={theme}
            color={theme.primary}
            onPress={() => {
              setChapterReaderSettings({
                tts: {
                  pitch: 1,
                  rate: 1,
                  voice: { name: 'System', language: 'System' } as Voice,
                },
              });
            }}
          />
        </View>
      </View>
      {TTSEnable ? (
        <>
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
        </>
      ) : null}
      <View style={styles.height} />
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
  label: {
    fontSize: 16,
    textAlign: 'center',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  height: { height: 16 },
});
