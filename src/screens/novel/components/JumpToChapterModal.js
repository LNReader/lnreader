import { FlashList } from '@shopify/flash-list';
import { getDialogBackground } from '@theme/colors';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Modal,
  Portal,
  Provider,
  Switch,
  TextInput,
  TouchableRipple,
  Text,
  useTheme,
} from 'react-native-paper';

const JumpToChapterModal = ({
  theme,
  hideModal,
  modalVisible,
  chapters,
  navigation,
  novel,
  chapterListRef,
}) => {
  const paperTheme = useTheme();
  const [mode, setMode] = useState(false);
  const [openChapter, setOpenChapter] = useState(true);

  const [text, setText] = useState();
  const [error, setError] = useState();
  const [result, setResult] = useState({ chapters: [] });

  const onDismiss = () => {
    hideModal();
    setText();
    setError();
  };
  const navigateToChapter = chap => {
    hideModal();
    navigation.navigate('Chapter', {
      sourceId: novel.sourceId,
      novelUrl: novel.novelUrl,
      novelId: novel.novelId,
      chapterId: chap.chapterId,
      chapterUrl: chap.chapterUrl,
      chapterName: chap.chapterName,
      novelName: novel.novelName,
      bookmark: chap.bookmark,
    });
  };

  const scrollToChapter = chap => {
    hideModal();
    chapterListRef.scrollToItem({
      animated: true,
      item: chap,
    });
  };

  const scrollToIndex = index => {
    hideModal();
    chapterListRef.scrollToIndex({
      animated: true,
      index: index,
    });
  };

  const renderItem = ({ item, extraData }) => {
    console.log(
      JSON.stringify({ ...paperTheme, colors: { ...theme } }, null, 2),
    );
    return (
      <TouchableRipple
        onPress={() => extraData(item)}
        theme={{ ...paperTheme, colors: { ...theme } }}
      >
        <Text style={{ color: theme.textColorPrimary }}>
          {item.chapterName}
        </Text>
      </TouchableRipple>
    );
  };

  const onSubmit = () => {
    if (!mode) {
      if (text > 0 && text <= chapters.length) {
        if (openChapter) {
          navigateToChapter(chapters[text - 1]);
        } else {
          scrollToIndex(text - 1);
        }
      } else {
        setError(`Enter a valid chapter number (≤ ${chapters.length})`);
      }
    } else {
      const chapter = chapters.filter(chap => {
        if (chap.chapterName.toLowerCase().includes(text.toLowerCase())) {
          return chap;
        }
      });
      if (chapter) {
        if (chapter.length === 1) {
          if (openChapter) {
            navigateToChapter(chapter);
          } else {
            scrollToChapter(chapter);
          }
        } else {
          if (openChapter) {
            setResult({ chapters: chapter, func: navigateToChapter });
          } else {
            setResult({ chapters: chapter, func: scrollToChapter });
          }
        }
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
        <View style={styles.switch}>
          <Text style={{ color: theme.textColorPrimary }}>Open Chapter</Text>
          <Switch
            value={openChapter}
            onValueChange={() => setOpenChapter(!openChapter)}
            color={theme.primary}
          />
        </View>
        <View style={styles.switch}>
          <Text style={{ color: theme.textColorPrimary }}>Chapter Name</Text>
          <Switch
            value={mode}
            onValueChange={() => setMode(!mode)}
            color={theme.primary}
          />
        </View>
        <View style={{ height: result.chapters.length === 0 ? 3 : 300 }}>
          <FlashList
            estimatedItemSize={70}
            data={result.chapters}
            extraData={result?.func}
            renderItem={renderItem}
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
  switch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  flashlist: {
    height: 'auto',
    maxHeight: 400,
  },
});
