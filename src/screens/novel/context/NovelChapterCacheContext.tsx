import React, { createContext, useContext, useMemo, useRef } from 'react';

type NovelChapterCacheContextType = {
  chapterTextCache: Map<number, string | Promise<string>>;
};

const NovelChapterCacheContext =
  createContext<NovelChapterCacheContextType | null>(null);

export function NovelChapterCacheContextProvider({
  children,
}: {
  children: React.JSX.Element;
}) {
  const chapterTextCache = useRef<Map<number, string | Promise<string>>>(
    new Map(),
  );

  const contextValue = useMemo(
    () => ({
      chapterTextCache: chapterTextCache.current,
    }),
    [],
  );
  return (
    <NovelChapterCacheContext.Provider value={contextValue}>
      {children}
    </NovelChapterCacheContext.Provider>
  );
}

export const useNovelChapterCache = () => {
  const context = useContext(NovelChapterCacheContext);
  if (!context) {
    throw new Error(
      'useNovelChapterCacheContext must be used within NovelChapterCacheContextProvider',
    );
  }
  return context;
};
