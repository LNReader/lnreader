import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { FAB, Portal } from 'react-native-paper';
import { Action, Actionbar } from '@components/Actionbar/Actionbar';
import { ThemeColors } from '@theme/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  markAllChaptersRead,
  markAllChaptersUnread,
} from '@database/queries/ChapterQueries';
import { removeNovelsFromLibrary } from '@database/queries/NovelQueries';
import { NovelInfo } from '@database/types'; // Assuming NovelInfo is defined
import { useHistory } from '@hooks/persisted';
import { getString } from '@strings/translations';
import { useNavigation } from '@react-navigation/native';

interface LibraryActionbarAndFABProps {
  selectedNovelIds: number[];
  setSelectedNovelIds: React.Dispatch<React.SetStateAction<number[]>>;
  showSetCategoryModal: () => void;
  refetchLibrary: () => void;
  useLibraryFAB: boolean;
  theme: ThemeColors;
}

const LibraryActionbarAndFAB: React.FC<LibraryActionbarAndFABProps> = ({
  selectedNovelIds,
  setSelectedNovelIds,
  showSetCategoryModal,
  refetchLibrary,
  useLibraryFAB,
  theme,
}) => {
  const { left: leftInset, right: rightInset } = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const { history } = useHistory();
  const lastRead = history?.[0];

  const fabLabel = useMemo(
    () =>
      lastRead
        ? getString('common.resume')
        : getString('novelScreen.startReadingChapters', {
            name: '',
          }).trim(),
    [lastRead],
  );

  const onFabPress = useCallback(() => {
    if (lastRead) {
      navigation.navigate('ReaderStack', {
        screen: 'Chapter',
        params: {
          novel: {
            path: lastRead.novelPath,
            pluginId: lastRead.pluginId,
            name: lastRead.novelName,
          } as NovelInfo,
          chapter: lastRead,
        },
      });
    }
  }, [navigation, lastRead]);

  const fabStyle = useMemo(
    () => [
      styles.fab,
      {
        backgroundColor: theme.primary,
        marginRight: rightInset + 16,
      },
    ],
    [theme.primary, rightInset],
  );

  const actionbarActions = useMemo<Action[]>(
    () => [
      {
        icon: 'label-outline',
        onPress: showSetCategoryModal,
      },
      {
        icon: 'check',
        onPress: async () => {
          await Promise.all(
            selectedNovelIds.map(id => markAllChaptersRead(id)),
          );
          setSelectedNovelIds([]);
          refetchLibrary();
        },
      },
      {
        icon: 'check-outline',
        onPress: async () => {
          await Promise.all(
            selectedNovelIds.map(id => markAllChaptersUnread(id)),
          );
          setSelectedNovelIds([]);
          refetchLibrary();
        },
      },
      {
        icon: 'delete-outline',
        onPress: () => {
          removeNovelsFromLibrary(selectedNovelIds);
          setSelectedNovelIds([]);
          refetchLibrary();
        },
      },
    ],
    [
      showSetCategoryModal,
      selectedNovelIds,
      setSelectedNovelIds,
      refetchLibrary,
    ],
  );

  return (
    <>
      <Portal>
        <Actionbar
          viewStyle={{ paddingLeft: leftInset, paddingRight: rightInset }}
          active={selectedNovelIds.length > 0}
          actions={actionbarActions}
        />
      </Portal>
      {useLibraryFAB && lastRead ? (
        <FAB
          style={fabStyle}
          color={theme.onPrimary}
          uppercase={false}
          label={fabLabel}
          icon="play"
          onPress={onFabPress}
        />
      ) : null}
    </>
  );
};

export default React.memo(LibraryActionbarAndFAB);

const styles = StyleSheet.create({
  fab: {
    bottom: 0,
    margin: 16,
    position: 'absolute',
    right: 0,
  },
});
