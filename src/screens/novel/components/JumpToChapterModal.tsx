import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  TextInput as RNTextInput,
} from 'react-native';
import { getString } from '@strings/translations';
import { Button, Modal, SwitchItem } from '@components';

import { Portal, Text } from 'react-native-paper';
import { useTheme } from '@hooks/persisted';
import { ChapterInfo, NovelInfo } from '@database/types';
import { NovelScreenProps } from '@navigators/types';
import { FlashList, ListRenderItem } from '@shopify/flash-list';

interface JumpToChapterModalProps {
  hideModal: () => void;
  modalVisible: boolean;
  chapters: ChapterInfo[];
  navigation: NovelScreenProps['navigation'];
  novel: NovelInfo;
  chapterListRef: React.RefObject<FlashList<ChapterInfo> | null>;
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

  const inputRef = useRef<RNTextInput>(null);
  const [inputFocused, setInputFocused] = useState(false);

  const onDismiss = () => {
    hideModal();
    setText('');
    inputRef.current?.clear();
    inputRef.current?.blur();
    setInputFocused(false);
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
    chapterListRef.current?.scrollToItem({
      animated: true,
      item: chap,
      viewPosition: 0.5,
    });
  };

  const scrollToIndex = (index: number) => {
    onDismiss();
    chapterListRef.current?.scrollToIndex({
      animated: true,
      index: index,
      viewPosition: 0.5,
    });
  };

  const executeFunction = (item: ChapterInfo) => {
    if (openChapter) {
      navigateToChapter(item);
    } else {
      scrollToChapter(item);
    }
  };

  const renderItem: ListRenderItem<ChapterInfo> = ({ item }) => {
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
  const placeholder = mode
    ? getString('novelScreen.jumpToChapterModal.chapterName')
    : getString('novelScreen.jumpToChapterModal.chapterNumber') +
      ` (≥ ${minNumber},  ≤ ${maxNumber})`;

  const borderWidth = inputFocused || error ? 2 : 1;
  const margin = inputFocused || error ? 0 : 1;
  return (
    <Portal>
      <Modal visible={modalVisible} onDismiss={onDismiss}>
        <View>
          <Text style={[styles.modalTitle, { color: theme.onSurface }]}>
            {getString('novelScreen.jumpToChapterModal.jumpToChapter')}
          </Text>
          <RNTextInput
            ref={inputRef}
            placeholder={placeholder}
            placeholderTextColor={'grey'}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmit}
            keyboardType={mode ? 'default' : 'numeric'}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            style={[
              {
                color: theme.onBackground,
                backgroundColor: theme.background,
                borderColor: error
                  ? theme.error
                  : inputFocused
                  ? theme.primary
                  : theme.outline,
                borderWidth: borderWidth,
                margin: margin,
              },
              styles.textInput,
            ]}
          />
          {!!error && (
            <Text style={[styles.errorText, { color: errorColor }]}>
              {error}
            </Text>
          )}
          <SwitchItem
            label={getString('novelScreen.jumpToChapterModal.openChapter')}
            value={openChapter}
            theme={theme}
            onPress={() => setOpenChapter(!openChapter)}
            size={20}
          />
          <SwitchItem
            label={getString('novelScreen.jumpToChapterModal.chapterName')}
            value={mode}
            theme={theme}
            onPress={() => setMode(!mode)}
            size={20}
          />
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
  dateCtn: {
    fontSize: 12,
    marginTop: 2,
  },
  errorText: {
    paddingTop: 12,
  },
  flashlist: {
    borderBottomWidth: 1,
    borderTopWidth: 1,
    height: 300,
    marginTop: 8,
  },
  listContentCtn: {
    paddingVertical: 8,
  },
  listElementContainer: {
    paddingVertical: 12,
  },
  modalFooterCtn: {
    flexDirection: 'row-reverse',
    paddingTop: 8,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
  textInput: {
    borderRadius: 4,
    borderStyle: 'solid',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});
