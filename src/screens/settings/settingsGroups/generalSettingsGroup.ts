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
          settingOrigin: 'Library',
          mode: 'single',
          valueKey: 'displayMode',
          options: displayModesList,
        },
        {
          title: getString('generalSettingsScreen.itemsPerRowLibrary'),
          type: 'Modal',
          settingOrigin: 'Library',
          description: val =>
            ''.concat(
              val + 1 + ' ' + getString('generalSettingsScreen.itemsPerRow'),
            ),
          mode: 'single',
          valueKey: 'novelsPerRow',
          options: gridSizeList,
        },
        {
          title: getString('generalSettingsScreen.novelBadges'),
          type: 'Modal',
          settingOrigin: 'Library',
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
          settingOrigin: 'Library',
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
          settingOrigin: 'App',
          valueKey: 'updateLibraryOnLaunch',
        },
        {
          title: getString('generalSettingsScreen.useFAB'),
          type: 'Switch',
          settingOrigin: 'App',
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
          settingOrigin: 'App',
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
          settingOrigin: 'App',
          valueKey: 'onlyUpdateOngoingNovels',
        },
        {
          title: getString('generalSettingsScreen.refreshMetadata'),
          description: getString(
            'generalSettingsScreen.refreshMetadataDescription',
          ),
          type: 'Switch',
          settingOrigin: 'App',
          valueKey: 'refreshNovelMetadata',
        },
        {
          title: getString('generalSettingsScreen.updateTime'),
          type: 'Switch',
          settingOrigin: 'lastUpdateTime',
          valueKey: 'showLastUpdateTime',
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
          settingOrigin: 'App',
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
          settingOrigin: 'App',
          valueKey: 'disableHapticFeedback',
        },
        {
          title: getString('generalSettingsScreen.disableLoadingAnimations'),
          description: getString(
            'generalSettingsScreen.disableLoadingAnimationsDesc',
          ),
          type: 'Switch',
          settingOrigin: 'App',
          valueKey: 'disableLoadingAnimations',
        },
      ],
    },
  ],
} as const;
export default GeneralSettings;
