import React from 'react';
import { StyleSheet, View, FlatList, Text, FlatListProps } from 'react-native';
import { useTheme } from '@hooks/persisted';

import ListView from '../../components/ListView';
import { useLibraryNovels } from '@screens/library/hooks/useLibrary';
import { Appbar } from '@components';
import { SourceNovelsScreenProps } from '@navigators/types';
import { NovelInfo } from '@database/types';

const SourceNovels = ({ navigation, route }: SourceNovelsScreenProps) => {
  const pluginId = route.params.pluginId;
  const theme = useTheme();
  const { library } = useLibraryNovels();

  const sourceNovels = library.filter(novel => novel.pluginId === pluginId);

  const renderItem: FlatListProps<NovelInfo>['renderItem'] = ({ item }) => (
    <ListView
      item={item}
      theme={theme}
      onPress={() =>
        navigation.navigate('MigrateNovel', {
          novel: item,
        })
      }
    />
  );

  return (
    <View style={[styles.container]}>
      <Appbar
        title="Select Novel"
        handleGoBack={navigation.goBack}
        theme={theme}
      />
      <FlatList
        data={sourceNovels}
        keyExtractor={item => 'migrateFrom' + item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text
            style={{
              color: theme.onSurfaceVariant,
              padding: 20,
              textAlign: 'center',
            }}
          >
            Your library does not have any novels from this source
          </Text>
        }
      />
    </View>
  );
};

export default SourceNovels;

const styles = StyleSheet.create({
  container: { flex: 1 },
});
