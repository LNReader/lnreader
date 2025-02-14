import React, { useEffect } from 'react';
import { MD3ThemeType } from '@theme/types';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { Menu, overlay } from 'react-native-paper';
import { getString } from '@strings/translations';
import { isChapterDownloaded } from '@database/queries/ChapterQueries';
import { useBoolean } from '@hooks/index';
import { IconButtonV2 } from '@components';

interface DownloadButtonProps {
  chapterId: number;
  isDownloaded: boolean;
  isDownloading?: boolean;
  theme: MD3ThemeType;
  deleteChapter: () => void;
  downloadChapter: () => void;
  setChapterDownloaded?: (value: boolean) => void;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  chapterId,
  isDownloaded,
  isDownloading,
  theme,
  deleteChapter,
  downloadChapter,
  setChapterDownloaded,
}) => {
  const [downloaded, setDownloaded] = React.useState<boolean | undefined>(
    isDownloaded,
  );

  const {
    value: deleteChapterMenuVisible,
    setTrue: showDeleteChapterMenu,
    setFalse: hideDeleteChapterMenu,
  } = useBoolean();

  useEffect(() => {
    if (!isDownloading) {
      const isDownloadedValue = isChapterDownloaded(chapterId);
      setDownloaded(isDownloadedValue);
      setChapterDownloaded?.(isDownloadedValue);
    }
  }, [chapterId, isDownloading, setChapterDownloaded]);
  if (isDownloading || downloaded === undefined) {
    return <ChapterDownloadingButton theme={theme} />;
  }
  return downloaded ? (
    <Menu
      visible={deleteChapterMenuVisible}
      onDismiss={hideDeleteChapterMenu}
      anchor={
        <DeleteChapterButton theme={theme} onPress={showDeleteChapterMenu} />
      }
      contentStyle={{ backgroundColor: overlay(2, theme.surface) }}
    >
      <Menu.Item
        onPress={() => {
          deleteChapter();
          hideDeleteChapterMenu();
          setDownloaded(false);
        }}
        title={getString('common.delete')}
        titleStyle={{ color: theme.onSurface }}
      />
    </Menu>
  ) : (
    <DownloadChapterButton
      theme={theme}
      onPress={() => {
        downloadChapter();
        setDownloaded(undefined);
      }}
    />
  );
};

interface theme {
  theme: MD3ThemeType;
}
type buttonPropType = theme & {
  onPress: () => void;
};
export const ChapterDownloadingButton: React.FC<theme> = ({ theme }) => (
  <ActivityIndicator
    color={theme.outline}
    size={25}
    style={styles.activityIndicator}
  />
);

export const DownloadChapterButton: React.FC<buttonPropType> = ({
  theme,
  onPress,
}) => (
  <IconButtonV2
    name="arrow-down-circle-outline"
    theme={theme}
    color={theme.outline}
    size={25}
    onPress={onPress}
    style={styles.iconButton}
  />
);

export const DeleteChapterButton: React.FC<buttonPropType> = ({
  theme,
  onPress,
}) => (
  <IconButtonV2
    name="check-circle"
    theme={theme}
    color={theme.onSurface}
    size={25}
    onPress={onPress}
    style={styles.iconButton}
  />
);

export const ChapterBookmarkButton: React.FC<theme> = ({ theme }) => (
  <IconButtonV2
    name="bookmark"
    theme={theme}
    color={theme.primary}
    size={18}
    style={styles.iconButtonLeft}
  />
);

const styles = StyleSheet.create({
  activityIndicator: { margin: 3.5, padding: 5 },
  iconButton: { margin: 2 },
  iconButtonLeft: { marginLeft: 2 },
});
