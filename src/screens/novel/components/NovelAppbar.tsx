import React, { memo, useCallback, useMemo, useState } from 'react';
import { getString } from '@strings/translations';
import { Appbar, Menu as DefaultMenu } from 'react-native-paper';
import { ThemeColors } from '@theme/types';
import Animated, {
  FadeIn,
  FadeOut,
  SharedValue,
  SlideInUp,
  SlideOutUp,
  interpolateColor,
  useAnimatedStyle,
} from 'react-native-reanimated';
import EpubIconButton from './EpubIconButton';
import { Share, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { MaterialDesignIconName } from '@type/icon';
import useNovelChapters from '@hooks/persisted/novel/useNovelChapters';
import useNovelState from '@hooks/persisted/novel/useNovelState';
import { useDownload } from '@hooks/persisted';
import { isNumber } from 'lodash-es';
import { resolveUrl } from '@services/plugin/fetch';

const Menu = React.memo(
  ({
    visible,
    onDismiss,
    anchor,
    items,
    theme,
  }: {
    visible: boolean;
    onDismiss: () => void;
    anchor: React.ReactNode;
    theme: ThemeColors;
    items: { label: string; onPress: () => void }[];
  }) => {
    return (
      <DefaultMenu
        visible={visible}
        onDismiss={onDismiss}
        anchor={anchor}
        anchorPosition="bottom"
        contentStyle={{ backgroundColor: theme.surface2 }}
      >
        {items.map((item, index) => (
          <DefaultMenu.Item
            key={index + item.label}
            title={item.label}
            style={{ backgroundColor: theme.surface2 }}
            titleStyle={{ color: theme.onSurface }}
            onPress={() => {
              onDismiss();
              item.onPress();
            }}
          />
        ))}
      </DefaultMenu>
    );
  },
);

const NovelAppbar = ({
  theme,
  isLocal,
  showEditInfoModal,
  downloadCustomChapterModal,
  goBack,
  showJumpToChapterModal,
  headerOpacity,
}: {
  theme: ThemeColors;
  isLocal: boolean | undefined;
  showEditInfoModal: React.Dispatch<React.SetStateAction<boolean>>;
  downloadCustomChapterModal: () => void;
  goBack: () => void;
  showJumpToChapterModal: (arg: boolean) => void;
  headerOpacity: SharedValue<number>;
}) => {
  const { novel, loading, setCustomNovelCover } = useNovelState();
  const { chapters, deleteChapters: _deleteChapters } = useNovelChapters();
  const { downloadChapters: _downloadChapters } = useDownload();

  const downloadChapters = useCallback(
    (amount: number | 'all' | 'unread') => {
      if (!novel) {
        return;
      }
      let filtered = chapters.filter(chapter => !chapter.isDownloaded);
      if (amount === 'unread') {
        filtered = filtered.filter(chapter => chapter.unread);
      }
      if (isNumber(amount)) {
        filtered = filtered.slice(0, amount);
      }
      if (filtered && !loading) {
        _downloadChapters(novel, filtered);
      }
    },
    [novel, chapters, loading, _downloadChapters],
  );

  const deleteChapters = useCallback(() => {
    _deleteChapters(chapters.filter(c => c.isDownloaded));
  }, [chapters, _deleteChapters]);

  const shareNovel = () => {
    if (!novel) {
      return;
    }
    Share.share({
      message: resolveUrl(novel.pluginId, novel.path, true),
    });
  };

  const headerOpacityStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      headerOpacity.value,
      [0, 1],
      ['transparent', theme.surface2 || theme.surface],
    );
    return {
      backgroundColor,
    };
  });

  const [downloadMenu, showDownloadMenu] = useState(false);
  const [extraMenu, showExtraMenu] = useState(false);

  const AppbarAction = useCallback(
    (props: {
      icon: MaterialDesignIconName;
      onPress: () => void;
      style?: StyleProp<ViewStyle>;
      size?: number;
    }) => {
      const AA = Animated.createAnimatedComponent(Appbar.Action);
      return (
        <AA
          entering={FadeIn.duration(250)}
          // delay to prevent flickering on rerenders
          exiting={FadeOut.delay(50).duration(250)}
          theme={{ colors: theme }}
          size={24}
          {...props}
        />
      );
    },
    [theme],
  );
  const downloadMenuItems = useMemo(() => {
    return [
      {
        label: getString('novelScreen.download.next'),
        onPress: () => downloadChapters(1),
      },
      {
        label: getString('novelScreen.download.next5'),
        onPress: () => downloadChapters(5),
      },
      {
        label: getString('novelScreen.download.next10'),
        onPress: () => downloadChapters(10),
      },
      {
        label: getString('novelScreen.download.custom'),
        onPress: () => downloadCustomChapterModal(),
      },
      {
        label: getString('novelScreen.download.unread'),
        onPress: () => downloadChapters('unread'),
      },
      {
        label: getString('common.all'),
        onPress: () => downloadChapters('all'),
      },
      {
        label: getString('novelScreen.download.delete'),
        onPress: () => deleteChapters(),
      },
    ];
  }, [deleteChapters, downloadChapters, downloadCustomChapterModal]);

  const openDlMenu = useCallback(() => showDownloadMenu(true), []);
  const closeDlMenu = useCallback(() => showDownloadMenu(false), []);

  return (
    <Animated.View
      entering={SlideInUp.duration(250)}
      exiting={SlideOutUp.duration(250)}
      style={headerOpacityStyle}
    >
      <Appbar.Header theme={{ colors: { ...theme, surface: 'transparent' } }}>
        <Appbar.BackAction onPress={goBack} />

        <View style={styles.row}>
          <EpubIconButton
            theme={theme}
            anchor={AppbarAction}
            chapters={chapters}
          />

          <AppbarAction icon="share-variant" onPress={shareNovel} />
          <AppbarAction
            icon="text-box-search-outline"
            onPress={() => {
              showJumpToChapterModal(true);
            }}
          />
          {!isLocal && (
            <Menu
              theme={theme}
              visible={downloadMenu}
              onDismiss={closeDlMenu}
              anchor={
                <Appbar.Action
                  theme={{ colors: theme }}
                  icon="download-outline"
                  onPress={openDlMenu}
                  size={26}
                />
              }
              items={downloadMenuItems}
            />
          )}
          <Menu
            visible={extraMenu}
            onDismiss={() => showExtraMenu(false)}
            anchor={
              <Appbar.Action
                theme={{ colors: theme }}
                icon="dots-vertical"
                onPress={() => showExtraMenu(true)}
                size={24}
              />
            }
            theme={theme}
            items={[
              {
                label: getString('novelScreen.edit.info'),
                onPress: () => {
                  showEditInfoModal(true);
                },
              },
              {
                label: getString('novelScreen.edit.cover'),
                onPress: () => {
                  setCustomNovelCover();
                },
              },
            ]}
          />
        </View>
      </Appbar.Header>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    position: 'absolute',
    right: 0,
  },
});

export default memo(NovelAppbar);
