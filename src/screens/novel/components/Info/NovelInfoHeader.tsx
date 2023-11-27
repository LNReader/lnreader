import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import color from 'color';

import Clipboard from '@react-native-community/clipboard';

import { IconButton } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { followNovelAction } from '../../../../redux/novel/novel.actions';
import { useSettings } from '../../../../hooks/reduxHooks';
import { showToast } from '../../../../hooks/showToast';

import {
  CoverImage,
  NovelAuthor,
  NovelInfo,
  NovelInfoContainer,
  NovelThumbnail,
  NovelTitle,
  NovelGenres,
} from './NovelInfoComponents';
import { Row } from '../../../../components/Common';
import ReadButton from './ReadButton';
import NovelSummary from '../NovelSummary/NovelSummary';
import NovelScreenButtonGroup from '../NovelScreenButtonGroup/NovelScreenButtonGroup';
import { useAppDispatch } from '../../../../redux/hooks';
import { getString } from '../../../../../strings/translations';
import { filterColor } from '../../../../theme/colors';
import { ChapterInfo, NovelInfo as NovelData } from '@database/types';
import { ThemeColors } from '@theme/types';
import { NovelScreenProps } from '@navigators/types';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { UseBooleanReturnType } from '@hooks/useBoolean';

interface NovelInfoHeaderProps {
  novel: NovelData;
  theme: ThemeColors;
  filter: string;
  chapters: ChapterInfo[];
  lastRead: ChapterInfo;
  navigation: NovelScreenProps['navigation'];
  trackerSheetRef: React.RefObject<BottomSheetModalMethods>;
  setCustomNovelCover: () => Promise<void>;
  novelBottomSheetRef: React.RefObject<BottomSheetModalMethods>;
  deleteDownloadsSnackbar: UseBooleanReturnType;
}

const NovelInfoHeader = ({
  novel,
  theme,
  filter,
  chapters,
  lastRead,
  navigation,
  trackerSheetRef,
  setCustomNovelCover,
  novelBottomSheetRef,
  deleteDownloadsSnackbar,
}: NovelInfoHeaderProps) => {
  const { hideBackdrop = false } = useSettings();

  const dispatch = useAppDispatch();

  const getStatusIcon = useCallback((status?: string) => {
    if (status === 'Ongoing') {
      return 'clocl-outline';
    }
    if (status === 'Completed') {
      return 'check-all';
    }
    return 'help';
  }, []);
  return (
    <>
      <CoverImage
        source={{ uri: novel.cover }}
        theme={theme}
        hideBackdrop={hideBackdrop}
      >
        <NovelInfoContainer>
          <NovelThumbnail
            source={{ uri: novel.cover }}
            theme={theme}
            setCustomNovelCover={setCustomNovelCover}
          />
          <View style={styles.novelDetails}>
            <NovelTitle
              theme={theme}
              onPress={() =>
                navigation.replace('GlobalSearchScreen', {
                  searchText: novel.name,
                })
              }
              onLongPress={() => {
                Clipboard.setString(novel.name);
                showToast('Copied to clipboard: ' + novel.name);
              }}
            >
              {novel.name}
            </NovelTitle>
            <Text
              style={{
                fontSize: 15,
                fontWeight: 'bold',
                color: theme.onBackground,
              }}
            >
              {`ID: ${novel.id}`}
            </Text>
            <>
              <NovelAuthor theme={theme}>
                {novel.author || 'Unknown author'}
              </NovelAuthor>
              <Row>
                <MaterialCommunityIcons
                  name={getStatusIcon(novel.status)}
                  size={14}
                  color={theme.onSurfaceVariant}
                  style={{ marginRight: 4 }}
                />
                <NovelInfo theme={theme}>
                  {(novel.status || 'Unknown status') + ' • ' + novel.pluginId}
                </NovelInfo>
              </Row>
            </>
          </View>
        </NovelInfoContainer>
      </CoverImage>
      <>
        <NovelScreenButtonGroup
          novel={novel}
          handleFollowNovel={() => {
            dispatch(followNovelAction(novel));
            if (
              novel.inLibrary &&
              chapters.some(chapter => chapter.isDownloaded)
            ) {
              deleteDownloadsSnackbar.setTrue();
            }
          }}
          handleTrackerSheet={() => trackerSheetRef.current?.present()}
          theme={theme}
        />
        <NovelSummary
          summary={novel.summary || 'No summary'}
          isExpanded={!novel.inLibrary}
          theme={theme}
        />
        {novel.genres ? (
          <NovelGenres theme={theme} genres={novel.genres} />
        ) : null}
        <ReadButton novel={novel} chapters={chapters} lastRead={lastRead} />
        <Pressable
          style={styles.bottomsheet}
          onPress={() => novelBottomSheetRef.current?.present()}
          android_ripple={{
            color: color(theme.primary).alpha(0.12).string(),
          }}
        >
          <Text style={[{ color: theme.onSurface }, styles.chapters]}>
            {`${chapters?.length} ${getString('novelScreen.chapters')}`}
          </Text>
          <IconButton
            icon="filter-variant"
            iconColor={filter ? filterColor(theme.isDark) : theme.onSurface}
            size={24}
          />
        </Pressable>
      </>
    </>
  );
};

export default memo(NovelInfoHeader);

const styles = StyleSheet.create({
  novelDetails: {
    flex: 1,
    paddingBottom: 16,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  chapters: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    fontSize: 16,
  },
  bottomsheet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 12,
  },
});
