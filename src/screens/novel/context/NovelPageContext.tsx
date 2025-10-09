import { useMMKVObject } from 'react-native-mmkv';
import { NOVEL_SETTINSG_PREFIX } from '@utils/constants/mmkv';
import { createContext, useMemo, useState } from 'react';

// PageStateContext.tsx
interface PageState {
  pages: string[];
  pageIndex: number;
}

interface PageActions {
  setPages: (pages: string[]) => void;
  setPageIndex: (index: number) => void;
}

export const NovelPageContext = createContext<(PageState & PageActions) | null>(
  null,
);

interface PageData {
  currentPage?: string;
}

export function NovelPageContextProvider({
  children,
  path,
  pluginId,
}: {
  children: React.JSX.Element;
  path: string;
  pluginId: string;
}) {
  const [pages, setPages] = useState<string[]>([]);
  const [pageData, setPageData] = useMMKVObject<PageData>(
    `${NOVEL_SETTINSG_PREFIX}_pageData_${pluginId}_${path}`,
  );

  // Calculate pageIndex based on persisted page name and current pages array
  const pageIndex = useMemo(() => {
    if (!pages.length) return 0;
    if (pageData?.currentPage) {
      const index = pages.indexOf(pageData.currentPage);
      return index >= 0 ? index : 0;
    }
    return 0;
  }, [pages, pageData?.currentPage]);

  const setPageIndex = useMemo(
    () => (index: number) => {
      if (pages[index]) {
        setPageData({ currentPage: pages[index] });
      }
    },
    [pages, setPageData],
  );

  const contextValue = useMemo(
    () => ({
      pages,
      pageIndex,
      setPages,
      setPageIndex,
    }),
    [pageIndex, pages, setPageIndex],
  );

  return (
    <NovelPageContext.Provider value={contextValue}>
      {children}
    </NovelPageContext.Provider>
  );
}
