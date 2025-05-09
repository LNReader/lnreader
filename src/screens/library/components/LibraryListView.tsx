import React, { useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { xor } from 'lodash-es';

import { EmptyView } from '@components/index';
import NovelCover from '@components/NovelCover';
import NovelList, { NovelListRenderItem } from '@components/NovelList';

import { NovelInfo } from '@database/types';

import { getString } from '@strings/translations';
import { useTheme } from '@hooks/persisted';
import { LibraryScreenProps } from '@navigators/types';
import ServiceManager from '@services/ServiceManager';

interface Props {
  categoryId: number;
  categoryName: string;
  novels: NovelInfo[];
  selectedNovelIds: number[];
  setSelectedNovelIds: React.Dispatch<React.SetStateAction<number[]>>;
  navigation: LibraryScreenProps['navigation'];
  pickAndImport: () => void;
}

export const LibraryView: React.FC<Props> = ({
  categoryId,
  categoryName,
  selectedNovelIds,
  setSelectedNovelIds,
  pickAndImport,
  navigation,
  novels,
}) => {
  const theme = useTheme();
  const renderItem = ({ item }: { item: NovelInfo }) => {
    return (
      <NovelCover
        item={item}
        theme={theme}
        isSelected={selectedNovelIds.includes(item.id)}
        onLongPress={() =>
          setSelectedNovelIds(xor(selectedNovelIds, [item.id]))
        }
        onPress={() => {
          if (selectedNovelIds.length) {
            setSelectedNovelIds(xor(selectedNovelIds, [item.id]));
          } else {
            navigation.navigate('ReaderStack', {
              screen: 'Novel',
              params: item,
            });
          }
        }}
        libraryStatus={false} // yes but actually no :D
        selectedNovelIds={selectedNovelIds}
      />
    );
  };

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    // local category
    if (categoryId === 2) {
      return;
    }
    setRefreshing(true);
    ServiceManager.manager.addTask({
      name: 'UPDATE_LIBRARY',
      data: {
        categoryId,
        categoryName,
      },
    });
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <NovelList
        data={novels}
        extraData={[selectedNovelIds]}
        renderItem={renderItem as NovelListRenderItem}
        ListEmptyComponent={
          <EmptyView
            theme={theme}
            icon="Σ(ಠ_ಠ)"
            description={getString('libraryScreen.empty')}
            actions={[
              categoryId !== 2
                ? {
                    iconName: 'compass-outline',
                    title: getString('browse'),
                    onPress: () => navigation.navigate('Browse'),
                  }
                : {
                    iconName: 'book-arrow-up-outline',
                    title: getString('advancedSettingsScreen.importEpub'),
                    onPress: pickAndImport,
                  },
            ]}
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
