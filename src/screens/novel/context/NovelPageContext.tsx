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

export function NovelPageContextProvider({
  children,
}: {
  children: React.JSX.Element;
}) {
  const [pages, setPages] = useState<string[]>([]);
  const [pageIndex, setPageIndex] = useState(0);

  const contextValue = useMemo(
    () => ({
      pages,
      pageIndex,
      setPages,
      setPageIndex,
    }),
    [pageIndex, pages],
  );

  return (
    <NovelPageContext.Provider value={contextValue}>
      {children}
    </NovelPageContext.Provider>
  );
}
