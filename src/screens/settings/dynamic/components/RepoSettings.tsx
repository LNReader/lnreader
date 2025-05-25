import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FAB, Portal } from 'react-native-paper';

import { EmptyView } from '@components';

import {
  createRepository,
  getRepositoriesFromDb,
  isRepoUrlDuplicated,
  updateRepository,
} from '@database/queries/RepositoryQueries';
import { Repository } from '@database/types';
import { useBoolean } from '@hooks/index';
import { usePlugins, useTheme } from '@hooks/persisted';
import { getString } from '@strings/translations';

import AddRepositoryModal from '../modals/AddRepositoryModal';
import CategorySkeletonLoading from '@screens/Categories/components/CategorySkeletonLoading';
import RepositoryCard from './RepositoryCard';
import { RouteProp, useIsFocused } from '@react-navigation/native';
import { SettingsStackParamList } from '@navigators/types';
import { showToast } from '@utils/showToast';

const RepoSettings = ({
  route: { params },
}: {
  route: RouteProp<SettingsStackParamList, 'RespositorySettings'>;
}) => {
  const theme = useTheme();
  const { refreshPlugins } = usePlugins();

  const [isLoading, setIsLoading] = useState(true);
  const [repositories, setRepositories] = useState<Repository[]>();
  const isFocused = useIsFocused();
  const getRepositories = async () => {
    try {
      const res = getRepositoriesFromDb();
      setRepositories(res);
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getRepositories();
  }, [isFocused]);

  const {
    value: addRepositoryModalVisible,
    setTrue: showAddRepositoryModal,
    setFalse: closeAddRepositoryModal,
  } = useBoolean();

  const upsertRepository = useCallback(
    (repositoryUrl: string, repository?: Repository) => {
      if (
        !new RegExp(/https?:\/\/(.*)plugins\.min\.json/).test(repositoryUrl)
      ) {
        showToast('Repository URL is invalid');
        return;
      }

      if (isRepoUrlDuplicated(repositoryUrl)) {
        showToast('A respository with this url already exists!');
      } else {
        if (repository) {
          updateRepository(repository.id, repositoryUrl);
        } else {
          createRepository(repositoryUrl);
        }
        getRepositories();
        refreshPlugins();
      }
    },
    [refreshPlugins],
  );

  useEffect(() => {
    if (params?.url) {
      upsertRepository(params.url);
    }
  }, [params, upsertRepository]);

  return (
    <>
      <FAB
        style={[styles.fab, { backgroundColor: theme.primary }]}
        color={theme.onPrimary}
        label={getString('common.add')}
        uppercase={false}
        onPress={showAddRepositoryModal}
        icon={'plus'}
      />
      <View style={[styles.full]}>
        {isLoading ? (
          <CategorySkeletonLoading width={360.7} height={89.5} theme={theme} />
        ) : !repositories || repositories.length === 0 ? (
          <EmptyView
            icon="Σ(ಠ_ಠ)"
            description={getString('repositories.emptyMsg')}
            theme={theme}
          />
        ) : (
          repositories.map(item => {
            return (
              <RepositoryCard
                key={item.id}
                repository={item}
                refetchRepositories={getRepositories}
                upsertRepository={upsertRepository}
              />
            );
          })
        )}

        <Portal>
          <AddRepositoryModal
            visible={addRepositoryModalVisible}
            closeModal={closeAddRepositoryModal}
            upsertRepository={upsertRepository}
          />
        </Portal>
      </View>
    </>
  );
};

export default RepoSettings;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    marginHorizontal: 16,
    right: 0,
    bottom: 0,
  },
  contentCtn: {
    flexGrow: 1,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  full: {
    flexGrow: 1,
  },
});
