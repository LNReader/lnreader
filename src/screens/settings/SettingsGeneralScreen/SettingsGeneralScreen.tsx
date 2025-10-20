import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

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
import { Appbar, List, SafeAreaView } from '@components';
import NovelSortModal from './modals/NovelSortModal';
import NovelBadgesModal from './modals/NovelBadgesModal';
import { NavigationState } from '@react-navigation/native';
import { getString } from '@strings/translations';
import SettingSwitch from '../components/SettingSwitch';
import SelectOneModal from './modals/SelectOneModal';
import { ShowChapterTitlesDisplayMapping } from '@hooks/persisted/useSettings';

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
    setLibrarySettings,
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
    disableLoadingAnimations,
    updateLibraryOnLaunch,
    downloadNewChapters,
    onlyUpdateOngoingNovels,
    defaultChapterSort,
    refreshNovelMetadata,
    disableHapticFeedback,
    useLibraryFAB,
    showChapterTitles = "always",
    setAppSettings,
  } = useAppSettings();

  const { showLastUpdateTime, setShowLastUpdateTime } = useLastUpdate();

  const generateNovelBadgesDescription = () => {
    const res = [];
    if (showDownloadBadges) {
      res.push(getString('libraryScreen.bottomSheet.display.download'));
    }
    if (showUnreadBadges) {
      res.push(getString('libraryScreen.bottomSheet.display.unread'));
    }
    if (showNumberOfNovels) {
      res.push(getString('libraryScreen.bottomSheet.display.numberOfItems'));
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

  /**
   * Hide Chapter Titles Modal
   */
  const showChapterTitlesModalRef = useBoolean();

  return (
    <SafeAreaView excludeTop>
      <Appbar
        title={getString('generalSettings')}
        // @ts-ignore
        handleGoBack={navigation.goBack}
        theme={theme}
      />
      <ScrollView contentContainerStyle={styles.paddingBottom}>
        <List.Section>
          <List.SubHeader theme={theme}>
            {getString('common.display')}
          </List.SubHeader>
          <List.Item
            title={getString('generalSettingsScreen.displayMode')}
            description={displayModesList[displayMode].label}
            onPress={displayModalRef.setTrue}
            theme={theme}
          />
          <List.Item
            title={getString('generalSettingsScreen.itemsPerRowLibrary')}
            description={
              novelsPerRow +
              ' ' +
              getString('generalSettingsScreen.itemsPerRow')
            }
            onPress={gridSizeModalRef.setTrue}
            theme={theme}
          />
          <List.Item
            title={getString('generalSettingsScreen.novelBadges')}
            // @ts-ignore
            description={novelBadgesDescription}
            onPress={novelBadgesModalRef.setTrue}
            theme={theme}
          />
          <List.Item
            title={getString('generalSettingsScreen.novelSort')}
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
          <SettingSwitch
            label={getString('generalSettingsScreen.updateLibrary')}
            description={getString('generalSettingsScreen.updateLibraryDesc')}
            value={updateLibraryOnLaunch}
            onPress={() =>
              setAppSettings({ updateLibraryOnLaunch: !updateLibraryOnLaunch })
            }
            theme={theme}
          />
          <SettingSwitch
            label={getString('generalSettingsScreen.useFAB')}
            value={useLibraryFAB}
            onPress={() => setAppSettings({ useLibraryFAB: !useLibraryFAB })}
            theme={theme}
          />
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>
            {getString('generalSettingsScreen.novel')}
          </List.SubHeader>
          <List.Item
            title={getString('generalSettingsScreen.chapterSort')}
            description={`${getString('generalSettingsScreen.bySource')} ${
              defaultChapterSort === 'ORDER BY position ASC'
                ? getString('generalSettingsScreen.asc')
                : getString('generalSettingsScreen.desc')
            }`}
            onPress={defaultChapterSortModal.setTrue}
            theme={theme}
          />
          <List.Item // TODO
            title={"Show chapter titles"}
            description={ShowChapterTitlesDisplayMapping()[showChapterTitles]}
            onPress={showChapterTitlesModalRef.setTrue}
            theme={theme}
          />
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>
            {getString('generalSettingsScreen.globalUpdate')}
          </List.SubHeader>
          <SettingSwitch
            label={getString('generalSettingsScreen.updateOngoing')}
            value={onlyUpdateOngoingNovels}
            onPress={() =>
              setAppSettings({
                onlyUpdateOngoingNovels: !onlyUpdateOngoingNovels,
              })
            }
            theme={theme}
          />
          <SettingSwitch
            label={getString('generalSettingsScreen.refreshMetadata')}
            description={getString(
              'generalSettingsScreen.refreshMetadataDescription',
            )}
            value={refreshNovelMetadata}
            onPress={() =>
              setAppSettings({ refreshNovelMetadata: !refreshNovelMetadata })
            }
            theme={theme}
          />
          <SettingSwitch
            label={getString('generalSettingsScreen.updateTime')}
            value={showLastUpdateTime}
            onPress={() => setShowLastUpdateTime(!showLastUpdateTime)}
            theme={theme}
          />
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>
            {getString('generalSettingsScreen.autoDownload')}
          </List.SubHeader>
          <SettingSwitch
            label={getString('generalSettingsScreen.downloadNewChapters')}
            value={downloadNewChapters}
            onPress={() =>
              setAppSettings({ downloadNewChapters: !downloadNewChapters })
            }
            theme={theme}
          />
          <List.Divider theme={theme} />
          <List.SubHeader theme={theme}>
            {getString('generalSettings')}
          </List.SubHeader>
          <SettingSwitch
            label={getString('generalSettingsScreen.disableHapticFeedback')}
            description={getString(
              'generalSettingsScreen.disableHapticFeedbackDescription',
            )}
            value={disableHapticFeedback}
            onPress={() =>
              setAppSettings({ disableHapticFeedback: !disableHapticFeedback })
            }
            theme={theme}
          />
          <SettingSwitch
            label={getString('generalSettingsScreen.disableLoadingAnimations')}
            description={getString(
              'generalSettingsScreen.disableLoadingAnimationsDesc',
            )}
            value={disableLoadingAnimations}
            onPress={() =>
              setAppSettings({
                disableLoadingAnimations: !disableLoadingAnimations,
              })
            }
            theme={theme}
          />
        </List.Section>
      </ScrollView>
      <SelectOneModal
        title={getString('generalSettingsScreen.displayMode')}
        options={Object.fromEntries(displayModesList.map(mode => [mode.value, mode.label]))}
        value={displayMode + ''}
        setValue={value => setLibrarySettings({ displayMode: Number(value) })}
        visible={displayModalRef.value}
        dismiss={displayModalRef.setFalse}
        theme={theme}
      />
      <DefaultChapterSortModal
        defaultChapterSort={defaultChapterSort}
        displayModalVisible={defaultChapterSortModal.value}
        hideDisplayModal={defaultChapterSortModal.setFalse}
        setAppSettings={setAppSettings}
        theme={theme}
      />
      <SelectOneModal
        title={getString('generalSettingsScreen.gridSize')}
        description={getString('generalSettingsScreen.gridSizeDesc', {
          num: novelsPerRow,
        })}
        options={{
          5: 'XS',
          4: 'S',
          3: 'M',
          2: 'L',
          1: 'XL',
        }}
        value={novelsPerRow.toString()}
        setValue={novelsPerRow => {
          setLibrarySettings({ novelsPerRow: Number(novelsPerRow) })
        }}
        visible={gridSizeModalRef.value}
        dismiss={gridSizeModalRef.setFalse}
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
      <SelectOneModal
        title={"Show chapter titles"}
        options={ShowChapterTitlesDisplayMapping()}
        value={showChapterTitles}
        setValue={value => setAppSettings({ showChapterTitles: value as any })}
        visible={showChapterTitlesModalRef.value}
        dismiss={showChapterTitlesModalRef.setFalse}
        theme={theme}
      />
    </SafeAreaView>
  );
};

export default GenralSettings;

const styles = StyleSheet.create({
  paddingBottom: { paddingBottom: 32 },
});
