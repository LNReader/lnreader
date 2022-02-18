export const chapterFilters = [
  {
    label: 'Downloaded',
    filter: 'downloaded = 1',
  },
  {
    label: 'Read',
    filter: '`read` = 1',
  },
  {
    label: 'Bookmark',
    filter: 'bookmark = 1',
  },
];

export const chapterSortOrders = [
  {
    label: 'By source',
    ASC: 'chapterId ASC',
    DESC: 'chapterId DESC',
  },
];
