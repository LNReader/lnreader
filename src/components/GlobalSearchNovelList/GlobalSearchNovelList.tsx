import {ActivityIndicator, FlatList, StyleSheet} from 'react-native';
import React from 'react';
import useLibrary from '../../screens/LibraryScreen/hooks/useLibrary';
import {ThemeType} from '../../theme/types';
import {EmptyView, Text} from '..';
import {GlobalSearchResult} from '../../screens/BrowseScreen/GlobalSearchScreen/hooks/useGlobalSearch';
import {useNavigation} from '@react-navigation/native';
import GlobalSearchNovelCover from '../NovelCover/GlobalSearchNovelCover';

interface GlobalSearchNovelListProps {
  data: GlobalSearchResult[];
  theme: ThemeType;
}

const GlobalSearchNovelList: React.FC<GlobalSearchNovelListProps> = props => {
  const {theme, data} = props;
  const {novels: library} = useLibrary();
  const {navigate} = useNavigation();

  const inLibrary = (sourceId: number, novelUrl: string) =>
    library.some(
      novel => novel.novelUrl === novelUrl && novel.sourceId === sourceId,
    );

  return (
    <FlatList
      contentContainerStyle={styles.listContainer}
      keyExtractor={item => item.sourceId.toString()}
      {...props}
      data={data}
      renderItem={({item}) => (
        <>
          <Text paddingHorizontal={16} color={theme.textColorPrimary}>
            {item.sourceName}
          </Text>
          <Text
            paddingHorizontal={16}
            paddingVertical={4}
            color={theme.textColorSecondary}
            size={12}
          >
            {item.lang}
          </Text>
          {item.loading ? (
            <ActivityIndicator
              color={theme.primary}
              style={{marginVertical: 16}}
            />
          ) : (
            <FlatList
              contentContainerStyle={styles.novelList}
              data={item.novels}
              keyExtractor={item => item.novelUrl}
              renderItem={({item: novel}) => (
                <GlobalSearchNovelCover
                  item={novel}
                  theme={theme}
                  showInLibraryBadge={inLibrary(novel.sourceId, novel.novelUrl)}
                  onPress={() =>
                    navigate('NovelScreen' as never, {...item} as never)
                  }
                />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              ListEmptyComponent={
                <Text
                  style={[
                    {
                      color: item.error
                        ? theme.error
                        : theme.textColorSecondary,
                    },
                    styles.listEmpty,
                  ]}
                >
                  {item.error ? item.error : 'No results found'}
                </Text>
              }
            />
          )}
        </>
      )}
      ListEmptyComponent={
        <EmptyView
          theme={theme}
          description="Search a novel in your pinned sources"
        />
      }
    />
  );
};

export default GlobalSearchNovelList;

const styles = StyleSheet.create({
  listContainer: {
    flexGrow: 1,
  },
  novelList: {
    padding: 8,
  },
  listEmpty: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
});
