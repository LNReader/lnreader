import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useCallback, useMemo } from 'react';

import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { getString } from '@strings/translations';
import { useTheme } from '@redux/hooks';
import { GlobalSearchResult } from '../hooks/useGlobalSearch';
import GlobalSearchNovelItem from './GlobalSearchNovelItem';

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
  const keyExtractor = useCallback(item => item.source.sourceId.toString(), []);

  const errorColor = useMemo(
    () => (theme.statusBar === 'dark-content' ? '#B3261E' : '#F2B8B5'),
    [],
  );

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
              android_ripple={{ color: theme.rippleColor }}
              style={styles.sourceHeader}
              onPress={() =>
                navigation.navigate('SourceScreen', {
                  sourceId: item.source.sourceId,
                  sourceName: item.source.sourceName,
                  url: item.source.url,
                })
              }
            >
              <View>
                <Text
                  style={[styles.sourceName, { color: theme.textColorPrimary }]}
                >
                  {item.source.sourceName}
                </Text>
                <Text
                  style={[styles.language, { color: theme.textColorSecondary }]}
                >
                  {item.source.lang}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="arrow-right"
                size={24}
                color={theme.textColorPrimary}
              />
            </Pressable>
            {item.isLoading ? (
              <ActivityIndicator
                color={theme.colorAccent}
                style={styles.loading}
              />
            ) : item.error ? (
              <Text style={[styles.error, { color: errorColor }]}>
                {item.error}
              </Text>
            ) : (
              <FlatList
                horizontal
                contentContainerStyle={styles.novelsContainer}
                keyExtractor={novelItem =>
                  novelItem.novelUrl + novelItem.sourceId
                }
                data={item.novels}
                ListEmptyComponent={
                  <Text
                    style={[
                      styles.listEmpty,
                      { color: theme.textColorSecondary },
                    ]}
                  >
                    {getString('sourceScreen.noResultsFound')}
                  </Text>
                }
                renderItem={({ item: novelItem }) => (
                  <GlobalSearchNovelItem
                    novel={novelItem}
                    navigateToNovel={navigateToNovel}
                    theme={theme}
                  />
                )}
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
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
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
