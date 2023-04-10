import React from 'react';
import { StyleSheet, View, FlatList, Text } from 'react-native';
import { useTheme } from '@hooks/useTheme';

import ListView from '../../components/ListView';
import { useLibraryNovels } from '@screens/library/hooks/useLibrary';
import { Appbar } from '@components';
import NovelCover from '@components/NovelCover';

const SourceNovels = ({ navigation, route }) => {
  const pluginId = route.params;
  const theme = useTheme();
  const { library } = useLibraryNovels();

  const sourceNovels = library.filter(novel => novel.pluginId === pluginId);

  const renderItem = ({ item }) => (
    <ListView
      item={item}
      theme={theme}
      onPress={() =>
        navigation.navigate('MigrateNovel', {
          pluginId: item.pluginId,
          novel: item,
        })
      }
    />
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colorPrimaryDark }]}
    >
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
