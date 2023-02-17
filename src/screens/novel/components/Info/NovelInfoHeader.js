import React, { memo, useMemo } from 'react';
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

const NovelInfoHeader = ({
  item,
  novel,
  theme,
  filter,
  loading,
  chapters,
  lastRead,
  navigation,
  trackerSheetRef,
  setCustomNovelCover,
  novelBottomSheetRef,
  deleteDownloadsSnackbar,
}) => {
  const { hideBackdrop = false } = useSettings();

  const dispatch = useAppDispatch();

  const getStatusIcon = useMemo(
    () => ({
      Ongoing: 'clock-outline',
      Completed: 'check-all',
      Unknown: 'help',
    }),
    [],
  );

  return (
    <>
      <CoverImage
        source={{ uri: !loading ? novel.novelCover : item.novelCover }}
        theme={theme}
        hideBackdrop={hideBackdrop}
      >
        <NovelInfoContainer>
          <NovelThumbnail
            source={{ uri: !loading ? novel.novelCover : item.novelCover }}
            theme={theme}
            setCustomNovelCover={setCustomNovelCover}
          />
          <View style={styles.novelDetails}>
            <NovelTitle
              theme={theme}
              onPress={() =>
                navigation.replace('GlobalSearchScreen', {
                  searchText: item.novelName,
                })
              }
              onLongPress={() => {
                Clipboard.setString(item.novelName);
                showToast('Copied to clipboard: ' + item.novelName);
              }}
            >
              {item.novelName}
            </NovelTitle>
            <>
              <NovelAuthor theme={theme}>
                {!loading && novel.author ? novel.author : 'Unknown author'}
              </NovelAuthor>
              <Row>
                <MaterialCommunityIcons
                  name={getStatusIcon[novel.status] || getStatusIcon.Unknown}
                  size={14}
                  color={theme.onSurfaceVariant}
                  style={{ marginRight: 4 }}
                />
                <NovelInfo theme={theme}>
                  {!loading
                    ? (novel.status || 'Unknown status') + ' • ' + novel.source
                    : 'Unknown status • Unknown source'}
                </NovelInfo>
              </Row>
            </>
          </View>
        </NovelInfoContainer>
      </CoverImage>
      {!loading && (
        <>
          <NovelScreenButtonGroup
            novel={novel}
            handleFollowNovel={() => {
              dispatch(followNovelAction(novel));
              if (
                novel.followed &&
                chapters.some(chapter => chapter.downloaded === 1)
              ) {
                deleteDownloadsSnackbar.setTrue();
              }
            }}
            handleTrackerSheet={() => trackerSheetRef.current.expand()}
            theme={theme}
          />
          <NovelSummary
            summary={novel.novelSummary}
            isExpanded={!novel.followed}
            theme={theme}
          />
          {novel.genre ? (
            <NovelGenres theme={theme} genre={novel.genre} />
          ) : null}
          <ReadButton novel={novel} chapters={chapters} lastRead={lastRead} />
          <Pressable
            style={styles.bottomsheet}
            onPress={() => novelBottomSheetRef.current.expand()}
            android_ripple={{
              color: color(theme.primary).alpha(0.12).string(),
            }}
          >
            <Text style={[{ color: theme.onSurface }, styles.chapters]}>
              {`${chapters.length} ${getString('novelScreen.chapters')}`}
            </Text>
            <IconButton
              icon="filter-variant"
              iconColor={filter ? filterColor(theme.isDark) : theme.onSurface}
              size={24}
            />
          </Pressable>
        </>
      )}
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
