import React, { memo, useMemo, useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Menu, overlay } from 'react-native-paper';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import Color from 'color';
import { getString } from '@strings/translations';
import type { MD3ThemeType } from '@theme/types';
import { useTheme } from '@providers/ThemeProvider';
import { IconButtonV2 } from '@components';

interface Props {
  chapterId: number;
  isDownloaded: boolean | undefined;
  isDownloading?: boolean;
  theme: MD3ThemeType;
  deleteChapter: () => void;
  downloadChapter: () => void;
  setChapterDownloaded?: (value: boolean) => void;
}

const DownloadButtonControlled: React.FC<Props> = ({
  isDownloaded,
  isDownloading,
  theme,
  deleteChapter,
  downloadChapter,
  setChapterDownloaded,
}) => {
  // local menu state only
  const [menuVisible, setMenuVisible] = useState(false);

  const rippleStyle = useMemo(
    () => ({ color: Color(theme.primary).alpha(0.12).string() }),
    [theme.primary],
  );

  const menuContentStyle = useMemo(
    () => ({ backgroundColor: overlay(2, theme.surface) }),
    [theme.surface],
  );
  const menuTitleStyle = useMemo(
    () => ({ color: theme.onSurface }),
    [theme.onSurface],
  );

  const onDelete = useCallback(() => {
    deleteChapter();
    setMenuVisible(false);
    setChapterDownloaded?.(false);
  }, [deleteChapter, setChapterDownloaded]);

  const onDownload = useCallback(() => {
    downloadChapter();
  }, [downloadChapter]);

  if (isDownloading || isDownloaded === undefined) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          color={theme.outline}
          size={25}
          style={styles.activityIndicator}
        />
      </View>
    );
  }

  if (isDownloaded) {
    return (
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <View style={styles.container}>
            <Pressable
              style={styles.pressable}
              onPress={() => setMenuVisible(true)}
              android_ripple={rippleStyle}
            >
              <MaterialCommunityIcons
                name="check-circle"
                size={25}
                color={theme.onSurface}
              />
            </Pressable>
          </View>
        }
        contentStyle={menuContentStyle}
      >
        <Menu.Item
          onPress={onDelete}
          title={getString('common.delete')}
          titleStyle={menuTitleStyle}
        />
      </Menu>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.pressable}
        onPress={onDownload}
        android_ripple={rippleStyle}
      >
        <MaterialCommunityIcons
          name="arrow-down-circle-outline"
          size={25}
          color={theme.outline}
        />
      </Pressable>
    </View>
  );
};

function areEqual(a: Props, b: Props) {
  return (
    a.isDownloaded === b.isDownloaded &&
    a.isDownloading === b.isDownloading &&
    a.deleteChapter === b.deleteChapter &&
    a.downloadChapter === b.downloadChapter &&
    a.theme.primary === b.theme.primary &&
    a.theme.surface === b.theme.surface &&
    a.theme.outline === b.theme.outline
  );
}

export const DownloadButton = memo(DownloadButtonControlled, areEqual);

const ChapterBookmarkButtonI: React.FC = () => {
  const theme = useTheme();

  return (
    <IconButtonV2
      name="bookmark"
      theme={theme}
      color={theme.primary}
      size={18}
      style={styles.iconButtonLeft}
    />
  );
};
export const ChapterBookmarkButton = memo(ChapterBookmarkButtonI);

const styles = StyleSheet.create({
  activityIndicator: { margin: 3.5, padding: 5 },
  container: {
    borderRadius: 50,
    width: 40,
    height: 40,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressable: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonLeft: { marginLeft: 2 },
});
