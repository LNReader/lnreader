import React, { useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { xor } from 'lodash-es';
import { useNavigation } from '@react-navigation/native';

import { EmptyView } from '@components/index';
import NovelCover from '@components/NovelCover';
import NovelList, { NovelListRenderItem } from '@components/NovelList';

import { ExtendedNovel } from '@database/types';

import { getString } from '@strings/translations';
import { useAppDispatch } from '@redux/hooks';
import { useTheme } from '@hooks/useTheme';
import { updateLibraryAction } from '@redux/updates/updates.actions';

interface Props {
  categoryId: number;
  novels: ExtendedNovel[];
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
  const renderItem = ({ item }: { item: ExtendedNovel }) => (
    <NovelCover
      item={item}
      theme={theme}
      isSelected={selectedNovelIds.includes(item.id)}
      onLongPress={() => setSelectedNovelIds(xor(selectedNovelIds, [item.id]))}
      onPress={() => {
        if (selectedNovelIds.length) {
          setSelectedNovelIds(xor(selectedNovelIds, [item.id]));
        } else {
          navigate(
            'Novel' as never,
            {
              name: item.name,
              url: item.url,
              pluginId: item.pluginId,
            } as never,
          );
        }
      }}
      libraryStatus={false} // yes but actually no :D
      selectedNovels={selectedNovelIds}
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
            colors={[theme.onPrimary]}
            progressBackgroundColor={theme.primary}
          />
        }
      />
    </View>
  );
};
