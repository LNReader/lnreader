import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useCallback, useMemo } from 'react';
import color from 'color';

import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { getString } from '@strings/translations';
import { useTheme } from '@hooks/useTheme';

import { GlobalSearchResult } from '../hooks/useGlobalSearch';
import GlobalSearchNovelItem from './GlobalSearchNovelItem';
import { useLibraryNovels } from '@screens/library/hooks/useLibrary';
import { LibraryNovelInfo } from '@database/types';
import GlobalSearchSkeletonLoading from '@screens/browse/loadingAnimation/GlobalSearchSkeletonLoading';
import { switchNovelToLibrary } from '@database/queries/NovelQueries';

interface GlobalSearchResultsListProps {
  searchResults: GlobalSearchResult[];
  ListEmptyComponent?: JSX.Element;
}

const GlobalSearchResultsList: React.FC<GlobalSearchResultsListProps> = ({
  searchResults,
  ListEmptyComponent,
}) => {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const keyExtractor = useCallback(item => item.plugin.id, []);
  const { library, setLibrary } = useLibraryNovels();

  const novelInLibrary = (novelUrl: string) =>
    library?.some(novel => novel.url === novelUrl);

  const errorColor = useMemo(() => (theme.isDark ? '#B3261E' : '#F2B8B5'), []);

  const navigateToNovel = useCallback(
    item => navigation.push('Novel', item),
    [],
  );

  return (
    <FlatList<GlobalSearchResult>
      keyExtractor={keyExtractor}
      data={searchResults}
      contentContainerStyle={styles.resultList}
      renderItem={({ item }) => (
        <>
          <View>
            <Pressable
              android_ripple={{
                color: color(theme.primary).alpha(0.12).string(),
              }}
              style={styles.sourceHeader}
              onPress={() =>
                navigation.navigate('SourceScreen', {
                  pluginId: item.plugin.id,
                  pluginName: item.plugin.name,
                  url: item.plugin.url,
                })
              }
            >
              <View>
                <Text style={[styles.sourceName, { color: theme.onSurface }]}>
                  {item.plugin.name}
                </Text>
                <Text
                  style={[styles.language, { color: theme.onSurfaceVariant }]}
                >
                  {item.plugin.lang}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="arrow-right"
                size={24}
                color={theme.onSurface}
              />
            </Pressable>
            {item.isLoading ? (
              <GlobalSearchSkeletonLoading theme={theme} />
            ) : item.error ? (
              <Text style={[styles.error, { color: errorColor }]}>
                {item.error}
              </Text>
            ) : (
              <FlatList
                horizontal
                contentContainerStyle={styles.novelsContainer}
                keyExtractor={novelItem => novelItem.url}
                data={item.novels}
                ListEmptyComponent={
                  <Text
                    style={[
                      styles.listEmpty,
                      { color: theme.onSurfaceVariant },
                    ]}
                  >
                    {getString('sourceScreen.noResultsFound')}
                  </Text>
                }
                renderItem={({ item: novelItem }) => {
                  const inLibrary = novelInLibrary(novelItem.url);

                  return (
                    <GlobalSearchNovelItem
                      novel={novelItem}
                      pluginId={item.plugin.id}
                      inLibrary={inLibrary}
                      navigateToNovel={navigateToNovel}
                      theme={theme}
                      onLongPress={() => {
                        setLibrary(prevValues => {
                          if (inLibrary) {
                            return [
                              ...prevValues.filter(
                                novel => novel.url !== novelItem.url,
                              ),
                            ];
                          } else {
                            return [
                              ...prevValues,
                              {
                                url: novelItem.url,
                              } as LibraryNovelInfo,
                            ];
                          }
                        });
                        switchNovelToLibrary(novelItem.url, item.plugin.id);
                      }}
                    />
                  );
                }}
              />
            )}
          </View>
        </>
      )}
      ListEmptyComponent={ListEmptyComponent}
    />
  );
};

export default GlobalSearchResultsList;

const styles = StyleSheet.create({
  resultList: {
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 60,
  },
  sourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 8,
  },
  sourceName: {
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  language: {
    fontSize: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  error: {
    padding: 16,
    marginBottom: 16,
  },
  novelsContainer: {
    padding: 8,
  },
  listEmpty: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
});
