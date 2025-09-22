import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { Appbar as MaterialAppbar } from 'react-native-paper';

import EmptyView from '@components/EmptyView';
import { Appbar, List, SafeAreaView } from '@components';
import {
  deleteChapter,
  deleteDownloads,
  getDownloadedChapters,
} from '@database/queries/ChapterQueries';

import { useTheme } from '@providers/Providers';

import RemoveDownloadsDialog from './components/RemoveDownloadsDialog';
import UpdatesSkeletonLoading from '@screens/updates/components/UpdatesSkeletonLoading';
import UpdateNovelCard from '@screens/updates/components/UpdateNovelCard';
import { getString } from '@strings/translations';
import { DownloadsScreenProps } from '@navigators/types';
import { DownloadedChapter } from '@database/types';
import { showToast } from '@utils/showToast';

type DownloadGroup = Record<number, DownloadedChapter[]>;

const Downloads = ({ navigation }: DownloadsScreenProps) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState<DownloadedChapter[]>([]);
  const groupDownloadsByDate = useCallback(
    (localChapters: DownloadedChapter[]): DownloadedChapter[][] => {
      const dateGroups = localChapters.reduce((groups, item) => {
        const novelId = item.novelId;
        if (!groups[novelId]) {
          groups[novelId] = [];
        }

        groups[novelId].push(item);

        return groups;
      }, {} as DownloadGroup);
      return Object.values(dateGroups);
    },
    [],
  );

  /**
   * Confirm Clear downloads Dialog
   */
  const [visible, setVisible] = useState(false);
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const getChapters = async () => {
    const res = await getDownloadedChapters();
    setChapters(res);
  };

  const ListEmptyComponent = useCallback(
    () =>
      !loading ? (
        <EmptyView
          icon="(˘･_･˘)"
          description={getString('downloadScreen.noDownloads')}
        />
      ) : null,
    [loading],
  );

  useEffect(() => {
    getChapters().finally(() => setLoading(false));
  }, []);

  const groupedChapters = groupDownloadsByDate(chapters);

  return (
    <SafeAreaView excludeTop>
      <Appbar
        title={getString('common.downloads')}
        handleGoBack={navigation.goBack}
        theme={theme}
      >
        {chapters.length > 0 ? (
          <MaterialAppbar.Action
            icon="delete-sweep"
            iconColor={theme.onSurface}
            onPress={showDialog}
          />
        ) : null}
      </Appbar>

      <List.InfoItem title={getString('downloadScreen.dbInfo')} theme={theme} />
      {loading ? (
        <UpdatesSkeletonLoading theme={theme} />
      ) : (
        <FlatList
          contentContainerStyle={styles.flatList}
          data={groupedChapters}
          keyExtractor={(item, index) => 'downloadGroup' + index}
          renderItem={({ item }) => {
            return (
              <UpdateNovelCard
                onlyDownloadedChapters
                chapterList={item}
                descriptionText={getString('downloadScreen.downloadsLower')}
                deleteChapter={chapter => {
                  deleteChapter(
                    chapter.pluginId,
                    chapter.novelId,
                    chapter.id,
                  ).then(() => {
                    showToast(`${getString('common.delete')} ${chapter.name}`);
                    getChapters();
                  });
                }}
              />
            );
          }}
          ListEmptyComponent={<ListEmptyComponent />}
        />
      )}
      <RemoveDownloadsDialog
        dialogVisible={visible}
        hideDialog={hideDialog}
        onSubmit={() => {
          deleteDownloads(chapters);
          setChapters([]);
          hideDialog();
        }}
        theme={theme}
      />
    </SafeAreaView>
  );
};

export default Downloads;

const styles = StyleSheet.create({
  container: { flex: 1 },
  flatList: { flexGrow: 1, paddingVertical: 8 },
});
