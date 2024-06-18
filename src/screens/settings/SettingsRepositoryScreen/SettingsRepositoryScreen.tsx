import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { FAB, Portal } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { Appbar, EmptyView } from '@components';

import { getRepositoriesFromDb } from '@database/queries/RepositoryQueries';
import { Repository } from '@database/types';
import { useBoolean } from '@hooks/index';
import { useTheme } from '@hooks/persisted';
import { getString } from '@strings/translations';

import AddRepositoryModal from './components/AddRepositoryModal';
import CategorySkeletonLoading from '@screens/Categories/components/CategorySkeletonLoading';
import RepositoryCard from './components/RepositoryCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SettingsBrowseScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { bottom } = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [repositories, setRepositories] = useState<Repository[]>();
  const getRepositories = async () => {
    try {
      let res = await getRepositoriesFromDb();
      setRepositories(res);
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getRepositories();
  }, []);

  const {
    value: addRepositoryModalVisible,
    setTrue: showAddRepositoryModal,
    setFalse: closeAddRepositoryModal,
  } = useBoolean();

  return (
    <>
      <Appbar
        title={'Repositories'}
        handleGoBack={navigation.goBack}
        theme={theme}
      />
      {isLoading ? (
        <CategorySkeletonLoading width={360.7} height={89.5} theme={theme} />
      ) : (
        <FlatList
          data={repositories}
          contentContainerStyle={styles.contentCtn}
          renderItem={({ item }) => (
            <RepositoryCard
              repository={item}
              refetchRepositories={getRepositories}
            />
          )}
          ListEmptyComponent={
            <EmptyView
              icon="Σ(ಠ_ಠ)"
              description={getString('categories.emptyMsg')}
              theme={theme}
            />
          }
        />
      )}
      <FAB
        style={[styles.fab, { backgroundColor: theme.primary, bottom: bottom }]}
        color={theme.onPrimary}
        label={getString('common.add')}
        uppercase={false}
        onPress={showAddRepositoryModal}
        icon={'plus'}
      />
      <Portal>
        <AddRepositoryModal
          visible={addRepositoryModalVisible}
          closeModal={closeAddRepositoryModal}
          onSuccess={getRepositories}
        />
      </Portal>
    </>
  );
};

export default SettingsBrowseScreen;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
  },
  contentCtn: {
    flexGrow: 1,
    paddingVertical: 16,
    paddingBottom: 100,
  },
});
