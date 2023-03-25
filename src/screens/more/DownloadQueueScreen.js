import React, { useState } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import {
  FAB,
  ProgressBar,
  Appbar as MaterialAppbar,
  Menu,
  overlay,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { useTheme } from '@hooks/useTheme';

import {
  cancelDownload,
  pauseDownloads,
  resumeDownloads,
} from '../../redux/downloads/downloads.actions';

import BackgroundService from 'react-native-background-actions';
import { showToast } from '../../hooks/showToast';
import { Appbar, EmptyView } from '@components';

const DownloadQueue = ({ navigation }) => {
  const theme = useTheme();
  const { downloadQueue } = useSelector(state => state.downloadsReducer);

  const dispatch = useDispatch();

  const [visible, setVisible] = useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const [fab, setFab] = useState(BackgroundService.isRunning());

  return (
    <>
      <Appbar
        title="Download queue"
        handleGoBack={navigation.goBack}
        theme={theme}
      >
        <Menu
          visible={visible}
          onDismiss={closeMenu}
          anchor={
            <MaterialAppbar.Action
              icon="dots-vertical"
              iconColor={theme.onSurface}
              onPress={openMenu}
            />
          }
          contentStyle={{ backgroundColor: overlay(2, theme.surface) }}
        >
          <Menu.Item
            onPress={() => {
              if (downloadQueue.length > 0) {
                dispatch(cancelDownload());
                showToast('Downloads cancelled.');
              }
              closeMenu();
            }}
            title="Cancel downloads"
            titleStyle={{ color: theme.onSurface }}
          />
        </Menu>
      </Appbar>
      <FlatList
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        keyExtractor={item => item.chapterId.toString()}
        data={downloadQueue}
        renderItem={({ item }) => (
          <View style={{ padding: 16 }}>
            <Text style={{ color: theme.onSurface }}>{item.chapterName}</Text>
            <ProgressBar
              indeterminate={BackgroundService.isRunning() ? true : false}
              progress={!BackgroundService.isRunning() && 0}
              color={theme.primary}
              style={{ marginTop: 8 }}
            />
          </View>
        )}
        ListEmptyComponent={
          <EmptyView icon="(･o･;)" description="No downloads" theme={theme} />
        }
      />
      {downloadQueue.length > 0 && (
        <FAB
          style={[styles.fab, { backgroundColor: theme.primary }]}
          color={theme.onPrimary}
          label={fab ? 'Pause' : 'Resume'}
          uppercase={false}
          small
          icon={fab ? 'pause' : 'play'}
          onPress={() => {
            setFab(prevState => !prevState);
            BackgroundService.isRunning()
              ? dispatch(pauseDownloads())
              : dispatch(resumeDownloads(downloadQueue));
          }}
        />
      )}
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
