import { getCustomPages } from '@database/queries/ChapterQueries';
import { NovelInfo } from '@database/types';
import { NovelPageContext } from '@screens/novel/context/NovelPageContext';
import { useCallback, useContext, useMemo } from 'react';

const useNovelPages = () => {
  const novelPage = useContext(NovelPageContext);
  if (!novelPage) {
    throw new Error(
      'useNovelPages must be used within NovelPageContextProvider',
    );
  }
  const { pages, setPages, pageIndex, setPageIndex } = novelPage;

  const calculatePages = useCallback(
    (tmpNovel: NovelInfo, setNewPages?: boolean) => {
      let tmpPages: string[];
      if (tmpNovel.totalPages > 0) {
        tmpPages = Array(tmpNovel.totalPages)
          .fill(0)
          .map((_, idx) => String(idx + 1));
      } else {
        tmpPages = getCustomPages(tmpNovel.id).map(c => c.page);
      }
      const res = tmpPages.length > 1 ? tmpPages : ['1'];

      if (setNewPages) {
        setPages(res);
      }
      return res;
    },
    [setPages],
  );

  const openPage = useCallback(
    (index: number) => {
      setPageIndex(index);
    },
    [setPageIndex],
  );

  const page = pages[pageIndex];

  const result = useMemo(
    () => ({
      page,
      pages,
      pageIndex,
      setPageIndex,
      calculatePages,
      openPage,
    }),
    [page, pages, pageIndex, setPageIndex, calculatePages, openPage],
  );

  return result;
};

export default useNovelPages;
