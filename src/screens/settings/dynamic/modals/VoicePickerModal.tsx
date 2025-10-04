import React, { useState } from 'react';
import { StyleSheet } from 'react-native';

import {
  Portal,
  Modal,
  overlay,
  TextInput,
  ActivityIndicator,
} from 'react-native-paper';
import { RadioButton } from '@components/RadioButton/RadioButton';

import { useTheme } from '@hooks/persisted';
import { Voice } from 'expo-speech';
import { FlashList } from '@shopify/flash-list';
import { useSettingsContext } from '@components/Context/SettingsContext';

interface VoicePickerModalProps {
  visible: boolean;
  onDismiss: () => void;
  voices: Voice[];
}

const VoicePickerModal: React.FC<VoicePickerModalProps> = ({
  onDismiss,
  visible,
  voices,
}) => {
  const theme = useTheme();
  const [searchedVoices, setSearchedVoices] = useState<Voice[]>([]);
  const [searchText, setSearchText] = useState('');
  const { setSettings: setChapterReaderSettings, tts } = useSettingsContext();

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.containerStyle,
          { backgroundColor: overlay(2, theme.surface) },
        ]}
      >
        <FlashList
          ListHeaderComponent={
            <TextInput
              mode="outlined"
              underlineColor={theme.outline}
              theme={{ colors: { ...theme } }}
              onChangeText={text => {
                setSearchText(text);
                setSearchedVoices(
                  voices.filter(voice =>
                    voice.name
                      .toLocaleLowerCase()
                      .includes(text.toLocaleLowerCase()),
                  ),
                );
              }}
              value={searchText}
              placeholder="Search voice"
            />
          }
          ListHeaderComponentStyle={styles.paddingHorizontal}
          data={searchText ? searchedVoices : voices}
          extraData={tts?.voice}
          renderItem={({ item }) => (
            <RadioButton
              key={item.identifier}
              status={item.identifier === tts?.voice?.identifier}
              onPress={() =>
                setChapterReaderSettings({ tts: { ...tts, voice: item } })
              }
              label={item.name + ` (${item.language})`}
              labelStyle={{ fontFamily: item.name }}
              theme={theme}
            />
          )}
          keyExtractor={item => item.identifier || 'system'}
          removeClippedSubviews={true}
          ListEmptyComponent={
            <ActivityIndicator
              size={24}
              style={styles.marginTop}
              color={theme.primary}
            />
          }
        />
      </Modal>
    </Portal>
  );
};

export default VoicePickerModal;

const styles = StyleSheet.create({
  containerStyle: {
    paddingVertical: 24,
    margin: 20,
    borderRadius: 28,
    flex: 1,
  },
  paddingHorizontal: {
    paddingHorizontal: 12,
  },
  marginTop: {
    marginTop: 16,
  },
});
