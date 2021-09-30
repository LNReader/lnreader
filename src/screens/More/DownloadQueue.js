import React, {useState} from 'react';
import {FlatList, View, Text, StyleSheet} from 'react-native';
import {
  FAB,
  ProgressBar,
  Appbar as MaterialAppbar,
  Menu,
} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';

import {Appbar} from '../../components/Appbar';
import {ScreenContainer} from '../../components/Common';
import EmptyView from '../../components/EmptyView';

import {useTheme} from '../../hooks/reduxHooks';

import {
  cancelDownload,
  pauseDownloads,
  resumeDownloads,
} from '../../redux/downloads/downloads.actions';

import BackgroundService from 'react-native-background-actions';
import {showToast} from '../../hooks/showToast';

const DownloadQueue = ({navigation}) => {
  const theme = useTheme();
  const {downloadQueue} = useSelector(state => state.downloadsReducer);

  const dispatch = useDispatch();

  const [visible, setVisible] = useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const [fab, setFab] = useState(BackgroundService.isRunning());

  return (
    <ScreenContainer theme={theme}>
      <Appbar title="Download queue" onBackAction={navigation.goBack}>
        <Menu
          visible={visible}
          onDismiss={closeMenu}
          anchor={
            <MaterialAppbar.Action
              icon="dots-vertical"
              color={theme.textColorPrimary}
              onPress={openMenu}
            />
          }
          contentStyle={{backgroundColor: theme.menuColor}}
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
            titleStyle={{color: theme.textColorPrimary}}
          />
        </Menu>
      </Appbar>
      <FlatList
        contentContainerStyle={{flexGrow: 1}}
        keyExtractor={item => item.chapterId.toString()}
        data={downloadQueue}
        renderItem={({item}) => (
          <View style={{padding: 16}}>
            <Text style={{color: theme.textColorPrimary}}>
              {item.chapterName}
            </Text>
            <ProgressBar
              indeterminate={BackgroundService.isRunning() ? true : false}
              progress={!BackgroundService.isRunning() && 0}
              color={theme.colorAccent}
              style={{marginTop: 8}}
            />
          </View>
        )}
        ListEmptyComponent={
          <EmptyView icon="(･o･;)" description="No downloads" />
        }
      />
      {downloadQueue.length > 0 && (
        <FAB
          style={[styles.fab, {backgroundColor: theme.colorAccent}]}
          color={theme.textColorPrimary}
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
    </ScreenContainer>
  );
};

export default DownloadQueue;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
