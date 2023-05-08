import React from 'react';
import { StyleSheet, View, FlatList, Text } from 'react-native';

import MigrationSourceItem from './MigrationSourceItem';

import { useTheme } from '@hooks/useTheme';
import { usePluginReducer } from '@redux/hooks';
import { useLibraryNovels } from '@screens/library/hooks/useLibrary';
import { Appbar } from '@components';

const Migration = ({ navigation }) => {
  const theme = useTheme();

  const { library } = useLibraryNovels();
  let { installedPlugins } = usePluginReducer();

  const novelsPerSource = pluginId =>
    library.filter(novel => novel.pluginId === pluginId).length;

  plugins = installedPlugins.filter(
    plugin => library.find(novel => novel.pluginId === plugin.id) !== undefined,
  );

  const renderItem = ({ item }) => (
    <MigrationSourceItem
      item={item}
      theme={theme}
      noOfNovels={novelsPerSource(item.id)}
      onPress={() => navigation.navigate('SourceNovels', item.id)}
    />
  );

  const ListHeaderComponent = (
    <Text style={[{ color: theme.onSurfaceVariant }, styles.listHeader]}>
      Select a Source To Migrate From
    </Text>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colorPrimaryDark }]}
    >
      <Appbar
        title="Select Source"
        handleGoBack={navigation.goBack}
        theme={theme}
      />
      <FlatList
        data={plugins}
        contentContainerStyle={{ paddingBottom: 48 }}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeaderComponent}
      />
    </View>
  );
};

export default Migration;

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
