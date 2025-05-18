import React, { createContext, useContext, useRef } from 'react';
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

  return (
    <ChapterContext.Provider
      value={{
        novel,
        webViewRef,
        ...chapterHookContent,
      }}
    >
      {children}
    </ChapterContext.Provider>
  );
}

export const useChapterContext = () => {
  return useContext(ChapterContext);
};
