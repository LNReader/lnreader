import React from 'react';
import { StyleSheet, View, FlatList, Text } from 'react-native';

import { useSelector } from 'react-redux';

import { Appbar } from '../../../components/Appbar';
import MigrationSourceItem from './MigrationSourceItem';

import { useLibrary, useTheme } from '../../../hooks/reduxHooks';

const GlobalSearch = ({ navigation }) => {
  const theme = useTheme();

  const library = useLibrary();
  let { sources } = useSelector(state => state.sourceReducer);

  const novelsPerSource = sourceId =>
    library.filter(novel => novel.sourceId === sourceId).length;

  sources = sources.filter(
    source =>
      library.filter(novel => novel.sourceId === source.sourceId).length,
  );

  const renderItem = ({ item }) => (
    <MigrationSourceItem
      item={item}
      theme={theme}
      noOfNovels={novelsPerSource(item.sourceId)}
      onPress={() => navigation.navigate('SourceNovels', item.sourceId)}
    />
  );

  const ListHeaderComponent = (
    <Text style={[{ color: theme.textColorSecondary }, styles.listHeader]}>
      Select a Source To Migrate From
    </Text>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colorPrimaryDark }]}
    >
      <Appbar title="Select Source" onBackAction={navigation.goBack} />
      <FlatList
        data={sources}
        contentContainerStyle={{ paddingBottom: 48 }}
        keyExtractor={item => item.sourceId.toString()}
        renderItem={renderItem}
        ListHeaderComponent={ListHeaderComponent}
      />
    </View>
  );
};

export default GlobalSearch;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  listHeader: {
    padding: 20,
    paddingBottom: 10,
    textTransform: 'uppercase',
  },
});
