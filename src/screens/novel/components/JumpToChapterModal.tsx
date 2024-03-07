import { FlashList, FlashListProps } from '@shopify/flash-list';

import React, { useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { getString } from '@strings/translations';
import { Button } from '@components';

import { Modal, Portal, Switch, TextInput, Text } from 'react-native-paper';
import { useTheme } from '@hooks/persisted';
import { ChapterInfo, NovelInfo } from '@database/types';
import { NovelScreenProps } from '@navigators/types';

interface JumpToChapterModalProps {
  hideModal: () => void;
  modalVisible: boolean;
  chapters: ChapterInfo[];
  navigation: NovelScreenProps['navigation'];
  novel: NovelInfo;
  chapterListRef: FlashList<ChapterInfo> | null;
}

const JumpToChapterModal = ({
  hideModal,
  modalVisible,
  chapters,
  navigation,
  novel,
  chapterListRef,
}: JumpToChapterModalProps) => {
  const minNumber = Math.min(...chapters.map(c => c.chapterNumber || -1));
  const maxNumber = Math.max(...chapters.map(c => c.chapterNumber || -1));
  const theme = useTheme();
  const [mode, setMode] = useState(false);
  const [openChapter, setOpenChapter] = useState(false);

  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<ChapterInfo[]>([]);

  const onDismiss = () => {
    hideModal();
    setText('');
    setError('');
    setResult([]);
  };
  const navigateToChapter = (chap: ChapterInfo) => {
    onDismiss();
    navigation.navigate('Chapter', {
      novel: novel,
      chapter: chap,
    });
  };

  const scrollToChapter = (chap: ChapterInfo) => {
    onDismiss();
    chapterListRef?.scrollToItem({
      animated: true,
      item: chap,
      viewPosition: 91,
    });
  };

  const scrollToIndex = (index: number) => {
    onDismiss();
    chapterListRef?.scrollToIndex({
      animated: true,
      index: index,
      viewOffset: 91,
    });
  };

  const executeFunction = (item: ChapterInfo) => {
    if (openChapter) {
      navigateToChapter(item);
    } else {
      scrollToChapter(item);
    }
  };

  const renderItem: FlashListProps<ChapterInfo>['renderItem'] = ({ item }) => {
    return (
      <Pressable
        android_ripple={{ color: theme.rippleColor }}
        onPress={() => executeFunction(item)}
        style={styles.listElementContainer}
      >
        <Text numberOfLines={1} style={{ color: theme.onSurface }}>
          {item.name}
        </Text>
        {item?.releaseTime ? (
          <Text
            numberOfLines={1}
            style={[{ color: theme.onSurfaceVariant }, styles.dateCtn]}
          >
            {item.releaseTime}
          </Text>
        ) : null}
      </Pressable>
    );
  };

  const onSubmit = () => {
    if (!mode) {
      const num = Number(text);
      if (num && num >= minNumber && num <= maxNumber) {
        if (openChapter) {
          const chapter = chapters.find(c => c.chapterNumber === num);
          if (chapter) {
            return navigateToChapter(chapter);
          }
        } else {
          const index = chapters.findIndex(c => c.chapterNumber === num);
          return scrollToIndex(index);
        }
      }
      return setError(
        getString('novelScreen.jumpToChapterModal.error.validChapterNumber') +
          ` (${num < minNumber ? '≥ ' + minNumber : '≤ ' + maxNumber})`,
      );
    } else {
      const searchedChapters = chapters.filter(chap =>
        chap.name.toLowerCase().includes(text?.toLowerCase()),
      );

      if (!searchedChapters.length) {
        setError(
          getString('novelScreen.jumpToChapterModal.error.validChapterName'),
        );
        return;
      }

      if (searchedChapters.length === 1) {
        if (openChapter) {
          return navigateToChapter(searchedChapters[0]);
        }
        return scrollToChapter(searchedChapters[0]);
      }

      return setResult(searchedChapters);
    }
  };

  const onChangeText = (txt: string) => {
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
          { backgroundColor: theme.overlay3 },
        ]}
      >
        <View style={styles.modalHeaderCtn}>
          <Text style={[styles.modalTitle, { color: theme.onSurface }]}>
            {getString('novelScreen.jumpToChapterModal.jumpToChapter')}
          </Text>
          <TextInput
            value={text}
            placeholder={
              mode
                ? getString('novelScreen.jumpToChapterModal.chapterName')
                : getString('novelScreen.jumpToChapterModal.chapterNumber') +
                  ` (≥ ${minNumber},  ≤ ${maxNumber})`
            }
            onChangeText={onChangeText}
            onSubmitEditing={onSubmit}
            mode="outlined"
            theme={{ colors: { ...theme } }}
            underlineColor={theme.outline}
            dense
            keyboardType={mode ? 'default' : 'numeric'}
            error={error.length > 0}
          />
          <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>
          <View style={styles.switch}>
            <Text style={{ color: theme.onSurface }}>
              {getString('novelScreen.jumpToChapterModal.openChapter')}
            </Text>
            <Switch
              value={openChapter}
              onValueChange={() => setOpenChapter(!openChapter)}
              color={theme.primary}
            />
          </View>
          <View style={styles.switch}>
            <Text style={{ color: theme.onSurface }}>
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
          <View style={[styles.flashlist, { borderColor: theme.outline }]}>
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
          <Button title={getString('common.submit')} onPress={onSubmit} />
          <Button title={getString('common.cancel')} onPress={hideModal} />
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
