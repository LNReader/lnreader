import { openChapter } from '@utils/handleNavigateParams';
import { getDialogBackground } from '@theme/colors';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Modal, Portal, Switch, TextInput } from 'react-native-paper';

const JumpToChapterModal = ({
  theme,
  hideModal,
  modalVisible,
  chapters,
  navigation,
  novel,
}) => {
  const [mode, setMode] = useState(0);

  const [text, setText] = useState();
  const [error, setError] = useState();

  const onDismiss = () => {
    hideModal();
    setText();
    setError();
  };

  const onSubmit = () => {
    if (!mode) {
      if (text > 0 && text <= chapters.length) {
        navigation.navigate('Chapter', openChapter(novel, chapters[text - 1]));
        hideModal();
      } else {
        setError(`Enter a valid chapter number (≤ ${chapters.length})`);
      }
    } else {
      const chapter = chapters.find(chap =>
        chap.chapterName.toLowerCase().includes(text.toLowerCase()),
      );

      if (chapter) {
        navigation.navigate('Chapter', openChapter(novel, chapter));
        hideModal();
      } else {
        setError('Enter a valid chapter name');
      }
    }
  };

  const onChangeText = txt => setText(txt);

  return (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: getDialogBackground(theme) },
        ]}
      >
        <Text style={[styles.modalTitle, { color: theme.textColorPrimary }]}>
          Jump to Chapter
        </Text>
        <TextInput
          value={text}
          placeholder={
            mode ? 'Chapter Name' : `Chapter Number (≤ ${chapters.length})`
          }
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          mode="outlined"
          theme={{ colors: { ...theme } }}
          underlineColor={theme.textColorHint}
          dense
          error={error}
        />
        <Text style={styles.errorText}>{error}</Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 4,
          }}
        >
          <Text style={{ color: theme.textColorPrimary }}>Chapter Name</Text>
          <Switch
            value={mode}
            onValueChange={() => setMode(!mode)}
            color={theme.primary}
          />
        </View>
      </Modal>
    </Portal>
  );
};

export default JumpToChapterModal;

const styles = StyleSheet.create({
  modalContainer: {
    margin: 30,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF0033',
    paddingTop: 8,
  },
});
