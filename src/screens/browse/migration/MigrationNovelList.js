import React, { useState } from 'react';
import { StyleSheet, FlatList, Text, View } from 'react-native';
import { Portal, Modal } from 'react-native-paper';
import { getNovelAction } from '@redux/novel/novel.actions';
import GlobalSearchNovelCover from '../globalsearch/GlobalSearchNovelCover';

import { migrateNovel } from '@services/migrate/migrateNovel';
import { showToast } from '@hooks/showToast';

import { Button } from '@components';
import { getString } from '@strings/translations';
import { openNovel } from '@utils/handleNavigateParams';

const MigrationNovelList = ({
  data,
  fromNovel,
  theme,
  library,
  navigation,
}) => {
  const pluginId = data.id;
  const [selectedNovel, setSelectedNovel] = useState({});
  const [migrateNovelDialog, setMigrateNovelDialog] = useState(false);
  const showMigrateNovelDialog = () => setMigrateNovelDialog(true);
  const hideMigrateNovelDialog = () => setMigrateNovelDialog(false);

  const inLibrary = url => library.some(obj => obj.url === url);

  const renderItem = ({ item }) => (
    <GlobalSearchNovelCover
      novel={item}
      theme={theme}
      onPress={() => showModal(item.url, item.name)}
      onLongPress={() =>
        navigation.push('Novel', { pluginId: pluginId, ...item })
      }
      inLibrary={inLibrary(item.url)}
    />
  );

  const showModal = (url, name) => {
    if (inLibrary(url)) {
      showToast('Novel already in library');
    } else {
      setSelectedNovel({ url, name });
      showMigrateNovelDialog();
    }
  };

  return (
    <>
      <FlatList
        contentContainerStyle={styles.flatListCont}
        horizontal={true}
        data={data.novels}
        keyExtractor={item => item.id + item.url}
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
            {`Migrate ${selectedNovel.url}?`}
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
                await migrateNovel(pluginId, fromNovel, selectedNovel.url);
                showToast(`${fromNovel.name} migrated to new source.`);
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
