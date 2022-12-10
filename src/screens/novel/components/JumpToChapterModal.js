import { FlashList } from '@shopify/flash-list';
import { openChapter } from '@utils/handleNavigateParams';
import { getDialogBackground } from '@theme/colors';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import color from 'color';
import { getString } from '@strings/translations';

import {
  Modal,
  Portal,
  Switch,
  TextInput,
  TouchableRipple,
  Text,
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
  const [mode, setMode] = useState(false);
  const [openChapter, setOpenChapter] = useState(false);

  const [text, setText] = useState();
  const [error, setError] = useState();
  const [result, setResult] = useState([]);

  const onDismiss = () => {
    hideModal();
    setText();
    setError();
    setResult([]);
    setMode(false);
    setOpenChapter(false);
  };
  const navigateToChapter = chap => {
    onDismiss();
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
    onDismiss();
    chapterListRef.scrollToItem({
      animated: true,
      item: chap,
      viewOffset: 91,
    });
  };

  const scrollToIndex = index => {
    onDismiss();
    chapterListRef.scrollToIndex({
      animated: true,
      index: index,
      viewOffset: 91,
    });
  };

  const executeFunction = item => {
    if (openChapter) {
      navigateToChapter(item);
    } else {
      scrollToChapter(item);
    }
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableRipple
        rippleColor={theme.secondary}
        onPress={() => executeFunction(item)}
        style={[styles.listElementContainer]}
      >
        <Text
          numberOfLines={1}
          style={[{ color: theme.textColorPrimary }, styles.listElement]}
        >
          {item.chapterName}
        </Text>
      </TouchableRipple>
    );
  };

  const onSubmit = () => {
    if (!mode) {
      if (text > 0 && text <= chapters.length) {
        if (openChapter) {
          return navigateToChapter(chapters[text - 1]);
        }
        return scrollToIndex(text - 1);
      }
      return setError(
        getString('novelScreen.jumpToChapterModal.error.validChapterNumber') +
          ` (${text <= 0 ? '≤ 0' : '≤ ' + chapters.length})`,
      );
    }
    const chapter = chapters.filter(chap => {
      if (chap.chapterName.toLowerCase().includes(text.toLowerCase())) {
        return chap;
      }
    });
    if (chapter?.[0] && chapter.length !== chapters.length) {
      setError();
      if (chapter.length === 1) {
        if (openChapter) {
          return navigateToChapter(chapter[0]);
        }
        return scrollToChapter(chapter[0]);
      }
      if (openChapter) {
        return setResult(chapter);
      }
      return setResult(chapter);
    }
    setError(
      getString('novelScreen.jumpToChapterModal.error.validChapterName'),
    );
  };

  const onChangeText = txt => {
    setText(txt);
    setResult([]);
  };

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
          {getString('novelScreen.jumpToChapterModal.jumpToChapter')}
        </Text>
        <TextInput
          value={text}
          placeholder={
            mode
              ? getString('novelScreen.jumpToChapterModal.chapterName')
              : getString('novelScreen.jumpToChapterModal.chapterNumber') +
                ` (≤ ${chapters.length})`
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
          <Text style={{ color: theme.textColorPrimary }}>
            {getString('novelScreen.jumpToChapterModal.openChapter')}
          </Text>
          <Switch
            value={openChapter}
            onValueChange={() => setOpenChapter(!openChapter)}
            color={theme.primary}
          />
        </View>
        <View style={styles.switch}>
          <Text style={{ color: theme.textColorPrimary }}>
            {getString('novelScreen.jumpToChapterModal.chapterName')}
          </Text>
          <Switch
            value={mode}
            onValueChange={() => setMode(!mode)}
            color={theme.primary}
          />
        </View>
        <View
          style={
            result?.length === 0
              ? { height: 3 }
              : [
                  {
                    height: 300,
                    backgroundColor: color(theme.surface).alpha(0.5).string(),
                    borderColor: color(theme.secondaryContainer)
                      .alpha(0.5)
                      .string(),
                  },
                  styles.flashlist,
                ]
          }
        >
          <FlashList
            estimatedItemSize={70}
            data={result}
            extraData={openChapter}
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
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 2,
  },
  listElement: {
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    textAlignVertical: 'center',
    paddingHorizontal: 6,
  },
  listElementContainer: {
    height: 40,
  },
});
