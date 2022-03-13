import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

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

  const getNovelCoverUrl = () => {
    const defaultCover =
      'https://github.com/LNReader/lnreader-sources/blob/main/src/coverNotAvailable.jpg?raw=true';

    if (loading) {
      if (item.novelCover && !item.novelCover.startsWith('/')) {
        return item.novelCover;
      } else {
        return defaultCover;
      }
    } else {
      if (novel.novelCover && !novel.novelCover.startsWith('/')) {
        return novel.novelCover;
      } else {
        return defaultCover;
      }
    }
  };

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
        source={{ uri: getNovelCoverUrl() }}
        theme={theme}
        hideBackdrop={hideBackdrop}
      >
        <NovelInfoContainer>
          <NovelThumbnail
            source={{ uri: getNovelCoverUrl() }}
            theme={theme}
            setCustomNovelCover={setCustomNovelCover}
          />
          <View style={styles.novelDetails}>
            <NovelTitle
              theme={theme}
              onPress={() =>
                navigation.navigate('GlobalSearch', {
                  novelName: item.novelName,
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
                  name={getStatusIcon[novel.status]}
                  size={14}
                  color={theme.textColorSecondary}
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
                deleteDownloadsSnackbar.showModal();
              }
            }}
            handleTrackerSheet={() => trackerSheetRef.current.show()}
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
          <ReadButton
            novel={novel}
            chapters={chapters}
            navigation={navigation}
            theme={theme}
            lastRead={lastRead}
          />
          <Pressable
            style={styles.bottomsheet}
            onPress={() => novelBottomSheetRef.current.show()}
            android_ripple={{ color: theme.rippleColor }}
          >
            <Text style={[{ color: theme.textColorPrimary }, styles.chapters]}>
              {`${chapters.length} chapters`}
            </Text>
            <IconButton
              icon="filter-variant"
              color={filter ? theme.filterColor : theme.textColorPrimary}
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
    fontWeight: 'bold',
  },
  bottomsheet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 12,
  },
});
