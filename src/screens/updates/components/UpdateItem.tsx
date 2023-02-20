import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useState } from 'react';

import {
  ChapterItem as ChapterItemProps,
  Update,
} from '../../../database/types';
import FastImage from 'react-native-fast-image';
import { IconButtonV2 } from '../../../components';
import { useDownloadQueue } from '../../../redux/hooks';
import { List, Menu } from 'react-native-paper';
import { MD3ThemeType, ThemeColors } from '../../../theme/types';
import { coverPlaceholderColor } from '../../../theme/colors';
import {
  openChapterChapterTypes,
  openChapterNovelTypes,
  openNovelProps,
} from '@utils/handleNavigateParams';
import { DownloadButton } from './DownloadButton';
import { useTheme } from '@hooks/useTheme';
import ChapterItemType from '@screens/novel/components/ChapterItem';

interface UpdateCardProps {
  item: Update;
  navigateToChapter: (
    novel: openChapterNovelTypes,
    chapter: openChapterChapterTypes,
  ) => void;
  navigateToNovel: (novel: openNovelProps) => void;
  handleDownloadChapter: (
    sourceId: number,
    novelUrl: string,
    novelId: number,
    chapter: ChapterItemProps,
  ) => void;
  handleDeleteChapter: (
    sourceId: number,
    novelId: number,
    chapterId: number,
    chapterName: string,
  ) => void;
  theme: ThemeColors;
}

const UpdateItem: React.FC<UpdateCardProps> = ({
  item,
  navigateToChapter,
  navigateToNovel,
  handleDownloadChapter,
  handleDeleteChapter,
  theme,
}) => {
  const DLButton = () => {
    return (
      <>
        {isDownloading ? (
          <ActivityIndicator
            color={theme.outline}
            size={26}
            style={styles.downloading}
          />
        ) : !item.downloaded ? (
          <IconButtonV2
            name="arrow-down-circle-outline"
            size={25}
            onPress={() =>
              handleDownloadChapter(
                item.sourceId,
                item.novelUrl,
                item.novelId,
                item as ChapterItemProps,
              )
            }
            //color={theme.outline}
            theme={theme}
          />
        ) : (
          <Menu
            visible={menu}
            onDismiss={() => setMenu(false)}
            anchor={
              <IconButtonV2
                name="check-circle"
                size={25}
                onPress={() => setMenu(true)}
                theme={theme}
              />
            }
            contentStyle={{ backgroundColor: theme.overlay3 }}
          >
            <Menu.Item
              onPress={() =>
                handleDeleteChapter(
                  item.sourceId,
                  item.novelId,
                  item.chapterId,
                  item.chapterName,
                )
              }
              title="Delete"
              titleStyle={{ color: theme.onSurface }}
            />
          </Menu>
        )}
      </>
    );
  };
  //const titleColor = item.read ? theme.outline : theme.onSurface;
  const chapterNameColor = item.bookmark
    ? theme.primary
    : item.read
    ? theme.outline
    : theme.onSurfaceVariant;
  const downloadQueue = useDownloadQueue();

  const isDownloading = downloadQueue.some(
    (chapter: ChapterItemProps) => chapter.chapterId === item.chapterId,
  );

  const [menu, setMenu] = useState(false);
  console.log(item.chapterName);

  return <ChapterItemType title={item.chapterName} theme={theme} />;
};

export default UpdateItem;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cover: {
    height: 40,
    width: 40,
    borderRadius: 4,
    backgroundColor: coverPlaceholderColor,
  },
  imageContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameContainer: {
    flex: 1,
    marginLeft: 16,
    paddingRight: 16,
  },
  chapter: {
    fontSize: 10,
    paddingLeft: 24,
    paddingVertical: 0,
  },
  downloading: {
    margin: 8,
  },
  chapterDetails: {
    flex: 1,
    marginLeft: 16,
  },
  updateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});
