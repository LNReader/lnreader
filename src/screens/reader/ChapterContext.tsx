import React, { createContext, useContext, useState } from 'react';
import { ChapterInfo, NovelInfo } from '@database/types';

const defaultValue = {} as {
  novel: NovelInfo;
  chapter: ChapterInfo;
  setChapter: (chapter: ChapterInfo) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
  chapterText: string;
  setChapterText: (value: string) => void;
};

const ChapterContext = createContext<{
  novel: NovelInfo;
  chapter: ChapterInfo;
  setChapter: (chapter: ChapterInfo) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
  chapterText: string;
  setChapterText: (value: string) => void;
}>(defaultValue);

export function ChapterContextProvider({
  children,
  novel,
  initialChapter,
}: {
  children: React.JSX.Element;
  novel: NovelInfo;
  initialChapter: ChapterInfo;
}) {
  const [chapter, setChapter] = useState(initialChapter);
  const [loading, setLoading] = useState(true);
  const [chapterText, setChapterText] = useState('');
  return (
    <ChapterContext.Provider
      value={{
        novel,
        chapter,
        setChapter,
        loading,
        setLoading,
        chapterText,
        setChapterText,
      }}
    >
      {children}
    </ChapterContext.Provider>
  );
}

export const useChapterContext = () => {
  return useContext(ChapterContext);
};
