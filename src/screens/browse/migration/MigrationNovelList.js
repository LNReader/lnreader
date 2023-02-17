import React, { useState } from 'react';
import { StyleSheet, FlatList, Text, View } from 'react-native';

import { Portal, Modal } from 'react-native-paper';

import GlobalSearchNovelCover from '../globalsearch/GlobalSearchNovelCover';

import { migrateNovel } from '../../../database/queries/NovelQueries';
import { showToast } from '../../../hooks/showToast';

import { Button } from '@components';
import { getString } from '@strings/translations';
import { openNovel } from '@utils/handleNavigateParams';

const MigrationNovelList = ({ data, theme, library, navigation }) => {
  const [selectedNovel, setSelectedNovel] = useState(false);

  const [migrateNovelDialog, setMigrateNovelDialog] = useState(false);
  const showMigrateNovelDialog = () => setMigrateNovelDialog(true);
  const hideMigrateNovelDialog = () => setMigrateNovelDialog(false);

  const inLibrary = (sourceId, novelUrl) =>
    library.some(obj => obj.novelUrl === novelUrl && obj.sourceId === sourceId);

  const renderItem = ({ item }) => (
    <GlobalSearchNovelCover
      novel={item}
      theme={theme}
      onPress={() => showModal(item.sourceId, item.novelUrl, item.novelName)}
      onLongPress={() =>
        navigation.navigate(
          'Novel',
          openNovel({
            ...item,
            sourceId: item.sourceId,
          }),
        )
      }
      inLibrary={inLibrary(item.sourceId, item.novelUrl)}
    />
  );

  const showModal = (sourceId, novelUrl, novelName) => {
    if (inLibrary(sourceId, novelUrl)) {
      showToast('Novel already in library');
    } else {
      setSelectedNovel({ sourceId, novelUrl, novelName });
      showMigrateNovelDialog();
    }
  };

  return (
    <>
      <FlatList
        contentContainerStyle={styles.flatListCont}
        horizontal={true}
        data={data}
        keyExtractor={item => item.sourceId + item.novelUrl}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text
            style={{
              color: theme.onSurfaceVariant,
              padding: 8,
              paddingVertical: 4,
            }}
          >
            No results found
          </Text>
        }
      />
      <Portal>
        <Modal
          visible={migrateNovelDialog}
          onDismiss={hideMigrateNovelDialog}
          contentContainerStyle={{
            padding: 24,
            margin: 20,
            borderRadius: 28,
            backgroundColor: theme.overlay3,
          }}
        >
          <Text
            style={{
              color: theme.onSurface,
              fontSize: 18,
              marginBottom: 16,
            }}
          >
            {`Migrate ${selectedNovel.novelName}?`}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              onPress={hideMigrateNovelDialog}
              title={getString('common.cancel')}
            />
            <Button
              Button
              onPress={async () => {
                hideMigrateNovelDialog();
                await migrateNovel(
                  selectedNovel.sourceId,
                  selectedNovel.novelUrl,
                );
                showToast(`${selectedNovel.novelName} migrated to new source.`);
              }}
              title={getString('novelScreen.migrate')}
            />
          </View>
        </Modal>
      </Portal>
    </>
  );
};

export default MigrationNovelList;

const styles = StyleSheet.create({
  flatListCont: {
    flexGrow: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
});
