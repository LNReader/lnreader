import React from 'react';
import { MD3ThemeType } from '@theme/types';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { IconButton, Menu, overlay } from 'react-native-paper';
import { getString } from '@strings/translations';

interface DownloadButtonProps {
  isDownloaded: boolean;
  isDownloading?: boolean;
  theme: MD3ThemeType;
  deleteChapterMenuVisible: boolean;
  deleteChapter: () => void;
  downloadChapter: () => void;
  hideDeleteChapterMenu: () => void;
  showDeleteChapterMenu: () => void;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  isDownloaded,
  isDownloading,
  theme,
  deleteChapter,
  downloadChapter,
  hideDeleteChapterMenu,
  showDeleteChapterMenu,
  deleteChapterMenuVisible,
}) => {
  if (isDownloading) {
    return <ChapterDownloadingButton theme={theme} />;
  }
  return isDownloaded ? (
    <Menu
      visible={deleteChapterMenuVisible}
      onDismiss={hideDeleteChapterMenu}
      anchor={
        <DeleteChapterButton theme={theme} onPress={showDeleteChapterMenu} />
      }
      contentStyle={{ backgroundColor: overlay(2, theme.surface) }}
    >
      <Menu.Item
        onPress={deleteChapter}
        title={getString('common.delete')}
        titleStyle={{ color: theme.onSurface }}
      />
    </Menu>
  ) : (
    <DownloadChapterButton
      theme={theme}
      onPress={() => {
        downloadChapter();
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
  <IconButton
    icon="arrow-down-circle-outline"
    animated
    iconColor={theme.outline}
    size={25}
    onPress={onPress}
    style={styles.iconButton}
  />
);

export const DeleteChapterButton: React.FC<buttonPropType> = ({
  theme,
  onPress,
}) => (
  <IconButton
    icon="check-circle"
    animated
    iconColor={theme.onSurface}
    size={25}
    onPress={onPress}
    style={styles.iconButton}
  />
);

export const ChapterBookmarkButton: React.FC<theme> = ({ theme }) => (
  <IconButton
    icon="bookmark"
    iconColor={theme.primary}
    size={18}
    style={styles.iconButtonLeft}
  />
);

const styles = StyleSheet.create({
  activityIndicator: { margin: 3.5, padding: 5 },
  iconButton: { margin: 2 },
  iconButtonLeft: { marginLeft: 2 },
});
