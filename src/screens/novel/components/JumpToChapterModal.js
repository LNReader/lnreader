import { FlashList } from '@shopify/flash-list';
import { dividerColor, getDialogBackground } from '@theme/colors';
import React, { useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { getString } from '@strings/translations';
import { Button } from '@components';
import color from 'color';

import { Modal, Portal, Switch, TextInput, Text } from 'react-native-paper';
import { useTheme } from '@hooks/useTheme';
import { ButtonVariation } from '@components/Button/Button';

const JumpToChapterModal = ({
  hideModal,
  modalVisible,
  chapters,
  navigation,
  novel,
  chapterListRef,
}) => {
  const theme = useTheme();

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
      <Pressable
        android_ripple={{ color: color(theme.primary).alpha(0.12).string() }}
        onPress={() => executeFunction(item)}
        style={styles.listElementContainer}
      >
        <Text numberOfLines={1} style={{ color: theme.textColorPrimary }}>
          {item.chapterName}
        </Text>
        {item?.releaseDate ? (
          <Text
            numberOfLines={1}
            style={[{ color: theme.textColorSecondary }, styles.dateCtn]}
          >
            {item.releaseDate}
          </Text>
        ) : null}
      </Pressable>
    );
  };

  const onSubmit = () => {
    if (!mode) {
      if (Number(text) && text > 0 && text <= chapters.length) {
        if (openChapter) {
          return navigateToChapter(chapters[text - 1]);
        }
        return scrollToIndex(text - 1);
      }
      return setError(
        getString('novelScreen.jumpToChapterModal.error.validChapterNumber') +
          ` (${text <= 0 ? '≤ 0' : '≤ ' + chapters.length})`,
      );
    } else {
      const chapter = chapters.filter(chap =>
        chap.chapterName.toLowerCase().includes(text?.toLowerCase()),
      );

      if (!chapter.length) {
        setError(
          getString('novelScreen.jumpToChapterModal.error.validChapterName'),
        );
        return;
      }

      if (chapter.length === 1) {
        if (openChapter) {
          return navigateToChapter(chapter[0]);
        }
        return scrollToChapter(chapter[0]);
      }

      return setResult(chapter);
    }
  };

  const onChangeText = txt => {
    setText(txt);
    setResult([]);
  };

  const errorColor = !theme.isDark ? '#B3261E' : '#F2B8B5';

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
        <View style={styles.modalHeaderCtn}>
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
          <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>
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
        </View>
        {result.length ? (
          <View
            style={[
              styles.flashlist,
              { borderColor: dividerColor(theme.isDark) },
            ]}
          >
            <FlashList
              estimatedItemSize={70}
              data={result}
              extraData={openChapter}
              renderItem={renderItem}
              contentContainerStyle={styles.listContentCtn}
            />
          </View>
        ) : null}
        <View style={styles.modalFooterCtn}>
          <Button
            title={getString('common.submit')}
            textColor={theme.primary}
            theme={theme}
            onPress={onSubmit}
            variation={ButtonVariation.CLEAR}
          />
          <Button
            title={getString('common.cancel')}
            textColor={theme.primary}
            theme={theme}
            onPress={hideModal}
            variation={ButtonVariation.CLEAR}
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
    borderRadius: 32,
  },
  modalHeaderCtn: {
    padding: 20,
    paddingTop: 32,
    paddingBottom: 0,
  },
  modalFooterCtn: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
  errorText: {
    paddingTop: 12,
  },
  switch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  flashlist: {
    marginTop: 8,
    height: 300,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  listContentCtn: {
    paddingVertical: 8,
  },
  dateCtn: {
    fontSize: 12,
    marginTop: 2,
  },
  listElementContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
});
