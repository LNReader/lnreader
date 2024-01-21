import React from 'react';
import { ScrollView } from 'react-native';

import SwitchSetting from '@components/Switch/Switch';
import DisplayModeModal from './modals/DisplayModeModal';
import GridSizeModal from './modals/GridSizeModal';

import {
  useAppSettings,
  useLastUpdate,
  useLibrarySettings,
  useTheme,
} from '@hooks/persisted';
import DefaultChapterSortModal from '../components/DefaultChapterSortModal';
import {
  DisplayModes,
  displayModesList,
  LibrarySortOrder,
} from '@screens/library/constants/constants';
import { useBoolean } from '@hooks';
import { Appbar, List } from '@components';
import NovelSortModal from './modals/NovelSortModal';
import NovelBadgesModal from './modals/NovelBadgesModal';
import { NavigationState } from '@react-navigation/native';
import { getString } from '@strings/translations';

interface GenralSettingsProps {
  navigation: NavigationState;
}

const GenralSettings: React.FC<GenralSettingsProps> = ({ navigation }) => {
  const theme = useTheme();

  const {
    displayMode = DisplayModes.Comfortable,
    novelsPerRow = 3,
    showDownloadBadges = true,
    showNumberOfNovels = false,
    showUnreadBadges = true,
    sortOrder = LibrarySortOrder.DateAdded_DESC,
  } = useLibrarySettings();

  const sortOrderDisplay: string[] = sortOrder.split(' ');
  const sortOrderNameMap = new Map<string, string>([
    ['name', 'libraryScreen.bottomSheet.sortOrders.alphabetically'],
    ['chaptersDownloaded', 'libraryScreen.bottomSheet.sortOrders.download'],
    ['chaptersUnread', 'libraryScreen.bottomSheet.sortOrders.totalChapters'],
    ['id', 'libraryScreen.bottomSheet.sortOrders.dateAdded'],
    ['lastReadAt', 'libraryScreen.bottomSheet.sortOrders.lastRead'],
    ['lastUpdatedAt', 'libraryScreen.bottomSheet.sortOrders.lastUpdated'],
  ]);
  const {
    updateLibraryOnLaunch,
    downloadNewChapters,
    onlyUpdateOngoingNovels,
    defaultChapterSort,
    refreshNovelMetadata,
    disableHapticFeedback,
    useLibraryFAB,
    setAppSettings,
  } = useAppSettings();

  const { showLastUpdateTime, setShowLastUpdateTime } = useLastUpdate();

  const generateNovelBadgesDescription = () => {
    let res = [];
    if (showDownloadBadges) {
      res.push('Download');
    }
    if (showUnreadBadges) {
      res.push('Unread');
    }
    if (showNumberOfNovels) {
      res.push('Number of Items');
    }
    return res.join(', ');
  };

  /**
   * Display Mode Modal
   */
  const displayModalRef = useBoolean();

  /**
   * Grid Size Modal
   */
  const gridSizeModalRef = useBoolean();

  /**
   * Novel Badges Modal
   */
  const novelBadgesModalRef = useBoolean();
  const novelBadgesDescription = generateNovelBadgesDescription();
  /**
   * Novel Sort Modal
   */
  const novelSortModalRef = useBoolean();
  /**
   * Chapter Sort Modal
   */
  const defaultChapterSortModal = useBoolean();
  return (
    <>
      <Appbar
        title={getString('moreScreen.settingsScreen.generalSettings')}
        // @ts-ignore
        handleGoBack={navigation.goBack}
        theme={theme}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <List.Section>
          <List.SubHeader theme={theme}>
            {getString(
              'moreScreen.settingsScreen.generalSettingsScreen.display',
            )}
          </List.SubHeader>
          <List.Item
            title={getString(
              'moreScreen.settingsScreen.generalSettingsScreen.displayMode',
            )}
            description={displayModesList[displayMode].label}
            onPress={displayModalRef.setTrue}
            theme={theme}
          />
          <List.Item
            title={getString(
              'moreScreen.settingsScreen.generalSettingsScreen.itemsPerRowLibrary',
            )}
            description={
              novelsPerRow +
              ' ' +
              getString(
                'moreScreen.settingsScreen.generalSettingsScreen.itemsPerRow',
              )
            }
            onPress={gridSizeModalRef.setTrue}
            theme={theme}
          />
          <List.Item
            title={getString(
              'moreScreen.settingsScreen.generalSettingsScreen.novelBadges',
            )}
            // @ts-ignore
            description={novelBadgesDescription}
            onPress={novelBadgesModalRef.setTrue}
            theme={theme}
          />
          <List.Item
            title={getString(
              'moreScreen.settingsScreen.generalSettingsScreen.novelSort',
            )}
            description={
              // @ts-ignore
              getString(sortOrderNameMap.get(sortOrderDisplay[0])) +
              ' ' +
              sortOrderDisplay[1]
            }
            onPress={novelSortModalRef.setTrue}
            theme={theme}
          />
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>{getString('library')}</List.SubHeader>
          <SwitchSetting
            label={getString(
              'moreScreen.settingsScreen.generalSettingsScreen.updateLibrary',
            )}
            description={'Not recommended for low devices'}
            value={updateLibraryOnLaunch}
            onPress={() =>
              setAppSettings({ updateLibraryOnLaunch: !updateLibraryOnLaunch })
            }
            theme={theme}
          />
          <SwitchSetting
            label={getString(
              'moreScreen.settingsScreen.generalSettingsScreen.useFAB',
            )}
            value={useLibraryFAB}
            onPress={() => setAppSettings({ useLibraryFAB: !useLibraryFAB })}
            theme={theme}
          />
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>
            {getString('moreScreen.settingsScreen.generalSettingsScreen.novel')}
          </List.SubHeader>
          <List.Item
            title={getString(
              'moreScreen.settingsScreen.generalSettingsScreen.chapterSort',
            )}
            description={`By source ${
              defaultChapterSort === 'ORDER BY id ASC'
                ? getString(
                    'moreScreen.settingsScreen.generalSettingsScreen.asc',
                  )
                : getString(
                    'moreScreen.settingsScreen.generalSettingsScreen.desc',
                  )
            }`}
            onPress={defaultChapterSortModal.setTrue}
            theme={theme}
          />
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>
            {getString(
              'moreScreen.settingsScreen.generalSettingsScreen.globalUpdate',
            )}
          </List.SubHeader>
          <SwitchSetting
            label={getString(
              'moreScreen.settingsScreen.generalSettingsScreen.updateOngoing',
            )}
            value={onlyUpdateOngoingNovels}
            onPress={() =>
              setAppSettings({
                onlyUpdateOngoingNovels: !onlyUpdateOngoingNovels,
              })
            }
            theme={theme}
          />
          <SwitchSetting
            label={getString(
              'moreScreen.settingsScreen.generalSettingsScreen.refreshMetadata',
            )}
            description={getString(
              'moreScreen.settingsScreen.generalSettingsScreen.refreshMetadataDescription',
            )}
            value={refreshNovelMetadata}
            onPress={() =>
              setAppSettings({ refreshNovelMetadata: !refreshNovelMetadata })
            }
            theme={theme}
          />
          <SwitchSetting
            label={getString(
              'moreScreen.settingsScreen.generalSettingsScreen.updateTime',
            )}
            value={showLastUpdateTime}
            onPress={() => setShowLastUpdateTime(!showLastUpdateTime)}
            theme={theme}
          />
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>
            {getString(
              'moreScreen.settingsScreen.generalSettingsScreen.autoDownload',
            )}
          </List.SubHeader>
          <SwitchSetting
            label={getString(
              'moreScreen.settingsScreen.generalSettingsScreen.downloadNewChapters',
            )}
            value={downloadNewChapters}
            onPress={() =>
              setAppSettings({ downloadNewChapters: !downloadNewChapters })
            }
            theme={theme}
          />
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>
            {getString('moreScreen.settingsScreen.generalSettings')}
          </List.SubHeader>
          <SwitchSetting
            label={getString(
              'moreScreen.settingsScreen.generalSettingsScreen.disableHapticFeedback',
            )}
            value={disableHapticFeedback}
            onPress={() =>
              setAppSettings({ disableHapticFeedback: !disableHapticFeedback })
            }
            theme={theme}
          />
        </List.Section>
      </ScrollView>
      <DisplayModeModal
        displayMode={displayMode}
        displayModalVisible={displayModalRef.value}
        hideDisplayModal={displayModalRef.setFalse}
        theme={theme}
      />
      <DefaultChapterSortModal
        defaultChapterSort={defaultChapterSort}
        displayModalVisible={defaultChapterSortModal.value}
        hideDisplayModal={defaultChapterSortModal.setFalse}
        setAppSettings={setAppSettings}
        theme={theme}
      />
      <GridSizeModal
        novelsPerRow={novelsPerRow}
        gridSizeModalVisible={gridSizeModalRef.value}
        hideGridSizeModal={gridSizeModalRef.setFalse}
        theme={theme}
      />
      <NovelBadgesModal
        novelBadgesModalVisible={novelBadgesModalRef.value}
        hideNovelBadgesModal={novelBadgesModalRef.setFalse}
        theme={theme}
      />
      <NovelSortModal
        novelSortModalVisible={novelSortModalRef.value}
        hideNovelSortModal={novelSortModalRef.setFalse}
        theme={theme}
      />
    </>
  );
};

export default GenralSettings;
