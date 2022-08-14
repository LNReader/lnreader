import { getString } from '@strings/translations';

export enum LibraryFilter {
  Downloaded = 'chaptersDownloaded > 0',
  Unread = 'unread = 1',
  Completed = "status LIKE 'Completed'",
  DownloadedOnly = 'AND chaptersDownloaded > 0',
  Started = 'unread = 0',
}

export const libraryFilterList = [
  {
    label: getString('libraryScreen.bottomSheet.filters.downloaded'),
    filter: LibraryFilter.Downloaded,
  },
  {
    label: getString('libraryScreen.bottomSheet.filters.unread'),
    filter: LibraryFilter.Unread,
  },
  {
    label: getString('libraryScreen.bottomSheet.filters.started'),
    filter: LibraryFilter.Started,
  },
  {
    label: getString('libraryScreen.bottomSheet.filters.completed'),
    filter: LibraryFilter.Completed,
  },
];

export enum LibrarySortOrder {
  Alphabetically_ASC = 'novels.novelName ASC',
  Alphabetically_DESC = 'novels.novelName DESC',
  Unread_ASC = 'novels.unread ASC',
  Unread_DESC = 'novels.unread DESC',
  Downloaded_ASC = 'chaptersDownloaded ASC',
  Downloaded_DESC = 'chaptersDownloaded DESC',
  TotalChapters_ASC = 'chaptersUnread ASC',
  TotalChapters_DESC = 'chaptersUnread DESC',
  DateAdded_ASC = 'novelId ASC',
  DateAdded_DESC = 'novelId DESC',
  LastRead_ASC = 'lastReadAt ASC',
  LastRead_DESC = 'lastReadAt DESC',
}

export const librarySortOrderList = [
  {
    label: 'Alphabetically',
    ASC: LibrarySortOrder.Alphabetically_ASC,
    DESC: LibrarySortOrder.Alphabetically_DESC,
  },
  {
    label: 'Last Read',
    ASC: LibrarySortOrder.LastRead_ASC,
    DESC: LibrarySortOrder.LastRead_DESC,
  },
  {
    label: 'Unread',
    ASC: LibrarySortOrder.Unread_ASC,
    DESC: LibrarySortOrder.Unread_DESC,
  },
  {
    label: 'Downloaded',
    ASC: LibrarySortOrder.Downloaded_ASC,
    DESC: LibrarySortOrder.Downloaded_DESC,
  },
  {
    label: 'Total chapters',
    ASC: LibrarySortOrder.TotalChapters_ASC,
    DESC: LibrarySortOrder.TotalChapters_DESC,
  },
  {
    label: getString('libraryScreen.bottomSheet.sortOrders.dateAdded'),
    ASC: LibrarySortOrder.DateAdded_ASC,
    DESC: LibrarySortOrder.DateAdded_DESC,
  },
];

export enum DisplayModes {
  Compact,
  Comfortable,
  CoverOnly,
  List,
}

export const displayModesList = [
  {
    label: getString('libraryScreen.bottomSheet.display.compact'),
    value: DisplayModes.Compact,
  },
  {
    label: getString('libraryScreen.bottomSheet.display.comfortable'),
    value: DisplayModes.Comfortable,
  },
  {
    label: getString('libraryScreen.bottomSheet.display.noTitle'),
    value: DisplayModes.CoverOnly,
  },
  {
    label: getString('libraryScreen.bottomSheet.display.list'),
    value: DisplayModes.List,
  },
];
