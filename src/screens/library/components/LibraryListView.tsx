import React from 'react';
import { View } from 'react-native';
import { xor } from 'lodash';
import { useNavigation } from '@react-navigation/native';

import { EmptyView } from '@components/index';
import NovelCover from '@components/NovelCover';
import NovelList from '@components/NovelList';

import { LibraryNovelInfo } from '../../../database/types';

import { setNovel } from '@redux/novel/novel.actions';

import { getString } from '@strings/translations';
import { useAppDispatch, useTheme } from '@redux/hooks';

interface Props {
  novels: LibraryNovelInfo[];
  selectedNovelIds: number[];
  setSelectedNovelIds: React.Dispatch<React.SetStateAction<number[]>>;
}

export const LibraryView: React.FC<Props> = ({
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

  return (
    <View style={{ flex: 1 }}>
      <NovelList
        data={novels}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyView
            theme={theme}
            icon="Σ(ಠ_ಠ)"
            description={getString('libraryScreen.empty')}
          />
        }
      />
    </View>
  );
};
