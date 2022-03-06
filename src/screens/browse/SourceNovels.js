import React from 'react';
import { StyleSheet, View, FlatList, Text } from 'react-native';
import { useLibrary, useTheme } from '../../hooks/reduxHooks';

import { Appbar } from '../../components/Appbar';
import ListView from '../../components/ListView';

const SourceNovels = ({ navigation, route }) => {
  const sourceId = route.params;
  const theme = useTheme();
  const library = useLibrary();

  const sourceNovels = library.filter(novel => novel.sourceId === sourceId);

  const renderItem = ({ item }) => (
    <ListView
      item={item}
      theme={theme}
      onPress={() =>
        navigation.navigate('MigrateNovel', {
          sourceId: item.sourceId,
          novelName: item.novelName,
        })
      }
    />
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colorPrimaryDark }]}
    >
      <Appbar title="Select Novel" onBackAction={() => navigation.goBack()} />
      <FlatList
        data={sourceNovels}
        keyExtractor={item => item.novelId.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text
            style={{
              color: theme.textColorSecondary,
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
