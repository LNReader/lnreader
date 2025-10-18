import { LibraryFilter } from '@screens/library/constants/constants';
import { LibraryNovelInfo, NovelInfo } from '../types';
import { getAllSync } from '../utils/helpers';

export const getLibraryNovelsFromDb = (
  sortOrder?: string,
  filter?: string,
  searchText?: string,
  downloadedOnlyMode?: boolean,
): NovelInfo[] => {
  let query = 'SELECT * FROM Novel WHERE inLibrary = 1';

  if (filter) {
    query += ` AND ${filter}`;
  }

  if (downloadedOnlyMode) {
    query += ` ${LibraryFilter.DownloadedOnly}`;
  }

  if (searchText) {
    query += ' AND name LIKE ?';
  }

  if (sortOrder) {
    query += ` ORDER BY ${sortOrder}`;
  }

  return getAllSync<NovelInfo>([query, [searchText ?? '']]);
};

const getNovelOfCategoryQuery =
  'SELECT DISTINCT novelId FROM NovelCategory WHERE 1 = 1';
const getNovelsFromIDListQuery = 'SELECT * FROM Novel WHERE inLibrary = 1 ';

export const getLibraryWithCategory = (
  categoryId?: number | null,
  onlyUpdateOngoingNovels?: boolean,
): LibraryNovelInfo[] => {
  let categoryQuery = getNovelOfCategoryQuery;

  if (categoryId) {
    categoryQuery += ` AND categoryId = ${categoryId}`;
  }

  const idRows = getAllSync<{ novelId: number }>([categoryQuery, []]);

  if (!idRows || idRows.length === 0) return [];

  const novelIds = idRows.map(r => r.novelId).join(',');

  let novelQuery = getNovelsFromIDListQuery;

  novelQuery += ` AND id IN (${novelIds})`;

  if (onlyUpdateOngoingNovels) {
    novelQuery += " AND status = 'Ongoing'";
  }

  const res = getAllSync<LibraryNovelInfo>([novelQuery, []]);

  return res;
};
