import {
  badgesList,
  chapterSortOrderList,
  displayModesList,
  gridSizeList,
  librarySortOrderList,
} from '@screens/library/constants/constants';
import { getString } from '@strings/translations';
import { generalIds, SettingsGroup } from '../Settings.d';
const sortOrderNameMap = new Map<string, string>([
  ['name', 'libraryScreen.bottomSheet.sortOrders.alphabetically'],
  ['chaptersDownloaded', 'libraryScreen.bottomSheet.sortOrders.download'],
  ['chaptersUnread', 'libraryScreen.bottomSheet.sortOrders.totalChapters'],
  ['id', 'libraryScreen.bottomSheet.sortOrders.dateAdded'],
  ['lastReadAt', 'libraryScreen.bottomSheet.sortOrders.lastRead'],
  ['lastUpdatedAt', 'libraryScreen.bottomSheet.sortOrders.lastUpdated'],
]);
const GeneralSettings: SettingsGroup<generalIds> = {
  groupTitle: getString('generalSettings'),
  icon: 'tune',
  navigateParam: 'GeneralSettings',
  subGroup: [
    {
      subGroupTitle: getString('common.display'),
      id: 'display',
      settings: [
        {
          title: getString('generalSettingsScreen.displayMode'),
          description: val => displayModesList[val].label,
          type: 'Modal',
          mode: 'single',
          valueKey: 'displayMode',
          options: displayModesList,
        },
        {
          title: getString('generalSettingsScreen.itemsPerRowLibrary'),
          type: 'Modal',
          description: val =>
            ''.concat(
              val + ' ' + getString('generalSettingsScreen.itemsPerRow'),
            ),
          mode: 'single',
          valueKey: 'novelsPerRow',
          options: gridSizeList,
        },
        {
          title: getString('generalSettingsScreen.novelBadges'),
          type: 'Modal',
          description: val =>
            badgesList
              .filter((v, i) => {
                return val[i];
              })
              .map(v => v.label)
              .join(', '),
          mode: 'multiple',
          options: badgesList,
        },
        {
          title: getString('generalSettingsScreen.novelSort'),
          type: 'Modal',
          description: val => {
            const v = val.split(' ');
            //@ts-expect-error
            return getString(sortOrderNameMap.get(v[0])) + ' ' + v[1];
          },
          mode: 'order',
          valueKey: 'sortOrder',
          options: librarySortOrderList,
        },
      ],
    },
    {
      subGroupTitle: getString('library'),
      id: 'library',
      settings: [
        {
          title: getString('generalSettingsScreen.updateLibrary'),
          description: getString('generalSettingsScreen.updateLibraryDesc'),
          type: 'Switch',
          valueKey: 'updateLibraryOnLaunch',
        },
        {
          title: getString('generalSettingsScreen.useFAB'),
          type: 'Switch',
          valueKey: 'useLibraryFAB',
        },
      ],
    },
    {
      subGroupTitle: getString('generalSettingsScreen.novel'),
      id: 'novel',
      settings: [
        {
          title: getString('generalSettingsScreen.chapterSort'),
          type: 'Modal',
          description: val =>
            `${getString('generalSettingsScreen.bySource')} ${
              val === 'ORDER BY position ASC'
                ? getString('generalSettingsScreen.asc')
                : getString('generalSettingsScreen.desc')
            }`,
          mode: 'order',
          valueKey: 'defaultChapterSort',
          options: chapterSortOrderList,
        },
      ],
    },
    {
      subGroupTitle: getString('generalSettingsScreen.globalUpdate'),
      id: 'globalUpdate',
      settings: [
        {
          title: getString('generalSettingsScreen.updateOngoing'),
          type: 'Switch',
          valueKey: 'onlyUpdateOngoingNovels',
        },
        {
          title: getString('generalSettingsScreen.refreshMetadata'),
          description: getString(
            'generalSettingsScreen.refreshMetadataDescription',
          ),
          type: 'Switch',
          valueKey: 'refreshNovelMetadata',
        },
        {
          title: getString('generalSettingsScreen.updateTime'),
          type: 'Switch',
          settingsOrigin: 'lastUpdateTime',
          valueKey: undefined,
        },
      ],
    },
    {
      subGroupTitle: getString('generalSettingsScreen.autoDownload'),
      id: 'autoDownload',
      settings: [
        {
          title: getString('generalSettingsScreen.downloadNewChapters'),
          type: 'Switch',
          valueKey: 'downloadNewChapters',
        },
      ],
    },
    {
      subGroupTitle: getString('generalSettings'),
      id: 'general',
      settings: [
        {
          title: getString('generalSettingsScreen.disableHapticFeedback'),
          description: getString(
            'generalSettingsScreen.disableHapticFeedbackDescription',
          ),
          type: 'Switch',
          valueKey: 'disableHapticFeedback',
        },
        {
          title: getString('generalSettingsScreen.disableLoadingAnimations'),
          description: getString(
            'generalSettingsScreen.disableLoadingAnimationsDesc',
          ),
          type: 'Switch',
          valueKey: 'disableLoadingAnimations',
        },
      ],
    },
  ],
} as const;
export default GeneralSettings;
