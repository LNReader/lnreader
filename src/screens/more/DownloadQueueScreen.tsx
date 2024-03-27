import React, { useMemo, useState } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import {
  FAB,
  ProgressBar,
  Appbar as MaterialAppbar,
  Menu,
  overlay,
} from 'react-native-paper';

import { useDownload, useTheme } from '@hooks/persisted';

import { showToast } from '../../utils/showToast';
import { getString } from '@strings/translations';
import { Appbar, EmptyView } from '@components';
import { DownloadQueueScreenProps } from '@navigators/types';
import { useMMKVString } from 'react-native-mmkv';
import { BACKGROUND_ACTION, BackgoundAction } from '@services/constants';

const DownloadQueue = ({ navigation }: DownloadQueueScreenProps) => {
  const theme = useTheme();
  const [currentAction] = useMMKVString(BACKGROUND_ACTION);
  const isDownloading = useMemo(
    () => currentAction === BackgoundAction.DOWNLOAD_CHAPTER,
    [currentAction],
  );
  const { queue, resumeDowndload, pauseDownload, cancelDownload } =
    useDownload();
  const [visible, setVisible] = useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  return (
    <>
      <Appbar
        title={getString('moreScreen.downloadQueue')}
        handleGoBack={navigation.goBack}
        theme={theme}
      >
        <Menu
          visible={visible}
          onDismiss={closeMenu}
          anchor={
            queue.length ? (
              <MaterialAppbar.Action
                icon="dots-vertical"
                iconColor={theme.onSurface}
                onPress={openMenu}
              />
            ) : null
          }
          contentStyle={{ backgroundColor: overlay(2, theme.surface) }}
        >
          <Menu.Item
            onPress={() => {
              cancelDownload();
              showToast(getString('downloadScreen.cancelled'));
              closeMenu();
            }}
            title={getString('downloadScreen.cancelDownloads')}
            titleStyle={{ color: theme.onSurface }}
          />
        </Menu>
      </Appbar>
      <FlatList
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        keyExtractor={item =>
          item.novel.pluginId + '_' + item.chapter.path.toString()
        }
        data={queue}
        renderItem={({ item }) => (
          <View style={{ padding: 16 }}>
            <Text style={{ color: theme.onSurface }}>{item.chapter.name}</Text>
            <ProgressBar
              indeterminate={
                isDownloading &&
                queue.length > 0 &&
                queue[0].chapter.id === item.chapter.id
              }
              color={theme.primary}
              style={{ marginTop: 8 }}
            />
          </View>
        )}
        ListEmptyComponent={
          <EmptyView
            icon="(･o･;)"
            description={getString('downloadScreen.noDownloads')}
            theme={theme}
          />
        }
      />
      {queue.length > 0 ? (
        <FAB
          style={[styles.fab, { backgroundColor: theme.primary }]}
          color={theme.onPrimary}
          label={
            isDownloading
              ? getString('common.pause')
              : getString('common.resume')
          }
          uppercase={false}
          icon={isDownloading ? 'pause' : 'play'}
          onPress={() => {
            isDownloading ? pauseDownload() : resumeDowndload();
          }}
        />
      ) : null}
    </>
  );
};

export default DownloadQueue;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 16,
  },
});
