import { LibraryFilter } from '@screens/library/constants/constants';
import { DBNovelInfo, LibraryNovelInfo } from '../types';
import { getAllSync } from '../utils/helpers';

export const getLibraryNovelsFromDb = ({
  sortOrder,
  filter,
  searchText = '',
  downloadedOnlyMode,
}: {
  sortOrder?: string;
  filter?: string;
  searchText?: string;
  downloadedOnlyMode?: boolean;
}): DBNovelInfo[] => {
  let query = 'SELECT * FROM Novel WHERE inLibrary = 1';

  if (filter) {
    query += ` AND ${filter} `;
  }
  if (downloadedOnlyMode) {
    query += ' ' + LibraryFilter.DownloadedOnly;
  }

  if (searchText) {
    if (!searchText.startsWith('%')) searchText = `%${searchText}`;
    if (!searchText.endsWith('%')) searchText = `${searchText}%`;
    query += ' AND name LIKE ? ';
  }

  if (sortOrder) {
    query += ` ORDER BY ${sortOrder} `;
  }

  return getAllSync<DBNovelInfo>([query, [searchText]]);
};

const getLibraryWithCategoryQuery =
  'SELECT * FROM NovelCategory NC JOIN Novel N on N.id = NC.novelId WHERE 1=1';

export const getLibraryWithCategory = ({
  filter,
  searchText,
  sortOrder,
  downloadedOnlyMode,
}: {
  sortOrder?: string;
  filter?: string;
  searchText?: string;
  downloadedOnlyMode?: boolean;
}): LibraryNovelInfo[] => {
  let query = getLibraryWithCategoryQuery;
  const preparedArgument: (string | number | null)[] = [];

  if (filter) {
    query += ` AND ${filter} `;
  }
  if (downloadedOnlyMode) {
    query += ' ' + LibraryFilter.DownloadedOnly;
  }

  if (searchText) {
    query += ' AND name LIKE ? ';
    preparedArgument.push(`%${searchText}%`);
  }

  if (sortOrder) {
    query += ` ORDER BY ${sortOrder} `;
  }

  const res = getAllSync<LibraryNovelInfo>([query, preparedArgument]);

  return res;
};
