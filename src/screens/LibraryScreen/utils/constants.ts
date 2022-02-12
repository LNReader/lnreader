export const libraryFilters = [
  {
    label: 'Downloaded',
    filter: 'chaptersDownloaded > 0',
  },
  {
    label: 'Unread',
    filter: 'unread = 1',
  },
  {
    label: 'Completed',
    filter: 'chaptersUnread IS NULL',
  },
];

export const librarySortOrders = [
  {
    label: 'Alphabetically',
    ASC: 'novels.novelName ASC',
    DESC: 'novels.novelName DESC',
  },
  {
    label: 'Unread',
    ASC: 'novels.unread ASC',
    DESC: 'novels.unread DESC',
  },
  {
    label: 'Downloaded',
    ASC: 'chaptersDownloaded ASC',
    DESC: 'chaptersDownloaded DESC',
  },
  {
    label: 'Total chapters',
    ASC: 'chaptersUnread ASC',
    DESC: 'chaptersUnread DESC',
  },
  {
    label: 'Date added',
    ASC: 'novelId ASC',
    DESC: 'novelId DESC',
  },
];
