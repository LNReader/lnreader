import React, { useEffect, useState } from 'react';
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
import ServiceManager from '@services/ServiceManager';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DownloadQueue = ({ navigation }: DownloadQueueScreenProps) => {
  const theme = useTheme();
  const { bottom } = useSafeAreaInsets();
  const { downloadQueue, resumeDowndload, pauseDownload, cancelDownload } =
    useDownload();
  const [isDownloading, setIsDownloading] = useState(
    ServiceManager.manager.isRunning,
  );
  const [visible, setVisible] = useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  useEffect(() => {
    if (downloadQueue.length === 0) {
      setIsDownloading(false);
    }
  }, [downloadQueue]);

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
            downloadQueue.length ? (
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
              setIsDownloading(false);
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
        keyExtractor={item => 'download_chapter_' + item.data.chapterId}
        data={downloadQueue}
        renderItem={({ item }) => (
          <View style={{ padding: 16 }}>
            <Text style={{ color: theme.onSurface }}>
              {item.data.chapterName}
            </Text>
            <ProgressBar
              indeterminate={
                isDownloading &&
                downloadQueue.length > 0 &&
                downloadQueue[0].data.chapterId === item.data.chapterId
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
      {downloadQueue.length > 0 ? (
        <FAB
          style={[styles.fab, { backgroundColor: theme.primary, bottom }]}
          color={theme.onPrimary}
          label={
            isDownloading
              ? getString('common.pause')
              : getString('common.resume')
          }
          uppercase={false}
          icon={isDownloading ? 'pause' : 'play'}
          onPress={() => {
            if (isDownloading) {
              pauseDownload();
              setIsDownloading(false);
            } else {
              resumeDowndload();
              setIsDownloading(true);
            }
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
