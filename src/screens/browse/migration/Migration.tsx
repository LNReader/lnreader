import React from 'react';
import { StyleSheet, View, FlatList, Text, FlatListProps } from 'react-native';

import MigrationSourceItem from './MigrationSourceItem';

import { usePlugins, useTheme } from '@hooks/persisted';
import { useLibraryNovels } from '@screens/library/hooks/useLibrary';
import { Appbar } from '@components';
import { MigrationScreenProps } from '@navigators/types';
import { PluginItem } from '@plugins/types';
import { getString } from '@strings/translations';

const Migration = ({ navigation }: MigrationScreenProps) => {
  const theme = useTheme();

  const { library } = useLibraryNovels();
  let { filteredInstalledPlugins } = usePlugins();

  const novelsPerSource = (pluginId: string) =>
    library.filter(novel => novel.pluginId === pluginId).length;

  const plugins = filteredInstalledPlugins.filter(
    plugin => library.find(novel => novel.pluginId === plugin.id) !== undefined,
  );

  const renderItem: FlatListProps<PluginItem>['renderItem'] = ({ item }) => (
    <MigrationSourceItem
      item={item}
      theme={theme}
      noOfNovels={novelsPerSource(item.id)}
      onPress={() => navigation.navigate('SourceNovels', { pluginId: item.id })}
    />
  );

  const ListHeaderComponent = (
    <Text style={[{ color: theme.onSurfaceVariant }, styles.listHeader]}>
      {getString('browseScreen.migration.selectSourceDesc')}
    </Text>
  );

  return (
    <View style={[styles.container]}>
      <Appbar
        title={getString('browseScreen.migration.selectSource')}
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
