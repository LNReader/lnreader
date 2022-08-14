import React, { useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { xor } from 'lodash';
import { useNavigation } from '@react-navigation/native';

import { EmptyView } from '@components/index';
import NovelCover from '@components/NovelCover';
import NovelList, { NovelListRenderItem } from '@components/NovelList';

import { LibraryNovelInfo } from '../../../database/types';

import { setNovel } from '@redux/novel/novel.actions';

import { getString } from '@strings/translations';
import { useAppDispatch, useTheme } from '@redux/hooks';
import { updateLibraryAction } from '@redux/updates/updates.actions';

interface Props {
  categoryId: number;
  novels: LibraryNovelInfo[];
  selectedNovelIds: number[];
  setSelectedNovelIds: React.Dispatch<React.SetStateAction<number[]>>;
}

export const LibraryView: React.FC<Props> = ({
  categoryId,
  novels,
  selectedNovelIds,
  setSelectedNovelIds,
}) => {
  const theme = useTheme();
  const { navigate } = useNavigation();
  const dispatch = useAppDispatch();

  const renderItem = ({ item }: { item: LibraryNovelInfo }) => (
    <NovelCover
      item={item}
      theme={theme}
      isSelected={selectedNovelIds.includes(item.novelId)}
      onLongPress={() =>
        setSelectedNovelIds(xor(selectedNovelIds, [item.novelId]))
      }
      onPress={() => {
        if (selectedNovelIds.length) {
          setSelectedNovelIds(xor(selectedNovelIds, [item.novelId]));
        } else {
          navigate('Novel' as never, item as never);
          dispatch(setNovel(item));
        }
      }}
    />
  );

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    dispatch(updateLibraryAction({ categoryId }));
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <NovelList
        data={novels}
        renderItem={renderItem as NovelListRenderItem}
        ListEmptyComponent={
          <EmptyView
            theme={theme}
            icon="Σ(ಠ_ಠ)"
            description={getString('libraryScreen.empty')}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colorButtonText]}
            progressBackgroundColor={theme.colorAccent}
          />
        }
      />
    </View>
  );
};
