import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { Appbar as MaterialAppbar } from 'react-native-paper';

import { useDispatch } from 'react-redux';

import { ScreenContainer } from '../../components/Common';
import EmptyView from '../../components/EmptyView';
import { Appbar, List } from '@components';
import {
  deleteDownloads,
  getDownloadedChapters,
} from '../../database/queries/ChapterQueries';

import { useTheme } from '@hooks/useTheme';

import RemoveDownloadsDialog from './components/RemoveDownloadsDialog';
import UpdatesSkeletonLoading from '@screens/updates/components/UpdatesSkeletonLoading';
import UpdateNovelCard from '@screens/updates/components/UpdateNovelCard';
import { getString } from '@strings/translations';

const Downloads = ({ navigation }) => {
  const theme = useTheme();

  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState([]);
  const groupUpdatesByDate = chapters => {
    const dateGroups = chapters.reduce((groups, item) => {
      const novelId = item.novelId;
      if (!groups[novelId]) {
        groups[novelId] = [];
      }

      groups[novelId].push(item);

      return groups;
    }, {});
    return Object.values(dateGroups);
  };

  /**
   * Confirm Clear downloads Dialog
   */
  const [visible, setVisible] = useState(false);
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const getChapters = async () => {
    const res = await getDownloadedChapters();
    setChapters(res);
    setLoading(false);
  };

  const ListEmptyComponent = () =>
    !loading && (
      <EmptyView
        icon="(˘･_･˘)"
        description={getString('downloadScreen.noDownloads')}
      />
    );

  useEffect(() => {
    getChapters();
  }, []);

  const renderItem = ({ item, index }) => (
    <UpdateNovelCard
      keyProp={index}
      item={item}
      dispatch={dispatch}
      theme={theme}
      descriptionText={getString('downloadScreen.downloadChapters')}
      removeItemFromList
    />
  );

  return (
    <ScreenContainer theme={theme}>
      <Appbar title="Downloads" handleGoBack={navigation.goBack} theme={theme}>
        {chapters.length > 0 && (
          <MaterialAppbar.Action
            icon="delete-sweep"
            iconColor={theme.onSurface}
            onPress={showDialog}
          />
        )}
      </Appbar>
      <List.InfoItem title={getString('downloadScreen.dbInfo')} theme={theme} />
      {loading ? (
        <UpdatesSkeletonLoading theme={theme} />
      ) : (
        <FlatList
          contentContainerStyle={styles.flatList}
          data={groupUpdatesByDate(chapters)}
          //keyExtractor={item => item.chapterId.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<ListEmptyComponent />}
        />
      )}
      <RemoveDownloadsDialog
        dialogVisible={visible}
        hideDialog={hideDialog}
        onSubmit={() => {
          deleteDownloads();
          setChapters([]);
          hideDialog();
        }}
        theme={theme}
      />
    </ScreenContainer>
  );
};

export default Downloads;

const styles = StyleSheet.create({
  container: { flex: 1 },
  flatList: { flexGrow: 1, paddingVertical: 8 },
});
