import { getCustomPages } from '@database/queries/ChapterQueries';
import { NovelInfo } from '@database/types';
import { NovelPageContext } from '@screens/novel/context/NovelPageContext';
import { useCallback, useContext } from 'react';

const useNovelPages = () => {
  const novelPage = useContext(NovelPageContext);
  if (!novelPage) {
    throw new Error(
      'useNovelState must be used within NovelPageContextProvider',
    );
  }
  const { setPages, pages, pageIndex } = novelPage;

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
  return { pages, pageIndex, calculatePages };
};

export default useNovelPages;
