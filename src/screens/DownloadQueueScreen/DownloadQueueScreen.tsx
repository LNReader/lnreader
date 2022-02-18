import {FlatList, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {useDownloadQueue, useTheme} from '../../redux/hooks';
import DownloadsQueueAppbar from './components/DownloadQueueAppbar/DownloadQueueAppbar';
import {EmptyView} from '../../components';
import {ProgressBar} from 'react-native-paper';
import BackgroundService from 'react-native-background-actions';
import {ChapterItem} from '../../database/types';

const DownloadQueueScreen = () => {
  const {goBack} = useNavigation();
  const theme = useTheme();

  const downloadQueue = useDownloadQueue();

  const renderItem = ({item}: {item: ChapterItem}) => (
    <View style={styles.queueCard}>
      <Text style={{color: theme.textColorPrimary}}>{item.chapterName}</Text>
      <ProgressBar
        indeterminate={BackgroundService.isRunning() ? true : false}
        progress={0}
        color={theme.primary}
        style={styles.progressBar}
      />
    </View>
  );

  return (
    <>
      <DownloadsQueueAppbar handleGoBack={goBack} theme={theme} />
      <FlatList
        contentContainerStyle={styles.container}
        keyExtractor={item => item.chapterId.toString()}
        data={downloadQueue}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyView icon="(･o･;)" description="No downloads" theme={theme} />
        }
      />
    </>
  );
};

export default DownloadQueueScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  queueCard: {
    margin: 16,
  },
  progressBar: {
    marginTop: 8,
  },
});
