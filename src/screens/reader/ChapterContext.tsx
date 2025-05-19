import React, { createContext, useContext, useMemo, useRef } from 'react';
import { ChapterInfo, NovelInfo } from '@database/types';
import WebView from 'react-native-webview';
import useChapter from './hooks/useChapter';

type ChapterContextType = ReturnType<typeof useChapter> & {
  novel: NovelInfo;
  webViewRef: React.RefObject<WebView<{}> | null>;
};

const defaultValue = {} as ChapterContextType;

const ChapterContext = createContext<ChapterContextType>(defaultValue);

export function ChapterContextProvider({
  children,
  novel,
  initialChapter,
}: {
  children: React.JSX.Element;
  novel: NovelInfo;
  initialChapter: ChapterInfo;
}) {
  const webViewRef = useRef<WebView>(null);
  const chapterHookContent = useChapter(webViewRef, initialChapter, novel);

  const contextValue = useMemo(
    () => ({
      novel,
      webViewRef,
      ...chapterHookContent,
    }),
    [novel, webViewRef, chapterHookContent],
  );

  return (
    <ChapterContext.Provider value={contextValue}>
      {children}
    </ChapterContext.Provider>
  );
}

export const useChapterContext = () => {
  return useContext(ChapterContext);
};
