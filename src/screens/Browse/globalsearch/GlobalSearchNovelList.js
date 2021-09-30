import React from 'react';
import {StyleSheet, FlatList, Text} from 'react-native';

import GlobalSearchNovelCover from './GlobalSearchNovelCover';

const GlobalSearchNovelList = ({data, theme, library, navigation}) => {
  const inLibrary = (sourceId, novelUrl) =>
    library.some(obj => obj.novelUrl === novelUrl && obj.sourceId === sourceId);

  const navigateToNovel = item => navigation.push('Novel', item);

  const renderItem = ({item}) => (
    <GlobalSearchNovelCover
      novel={item}
      theme={theme}
      onPress={() => navigateToNovel(item)}
      inLibrary={inLibrary(item.sourceId, item.novelUrl)}
    />
  );

  const ListEmptyComponent = (
    <Text style={[{color: theme.textColorSecondary}, styles.emptyList]}>
      No results found
    </Text>
  );

  return (
    <FlatList
      contentContainerStyle={styles.listContainer}
      horizontal={true}
      data={data}
      keyExtractor={item => item.novelUrl}
      renderItem={renderItem}
      ListEmptyComponent={ListEmptyComponent}
    />
  );
};

export default GlobalSearchNovelList;

const styles = StyleSheet.create({
  listContainer: {
    flexGrow: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  emptyList: {
    padding: 8,
    paddingVertical: 4,
  },
});
