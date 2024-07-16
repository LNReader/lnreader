import React, { createContext, useContext, useState } from 'react';
import { ChapterInfo, NovelInfo } from '@database/types';

const defaultValue = {} as {
  novel: NovelInfo;
  chapter: ChapterInfo;
  setChapter: (chapter: ChapterInfo) => void;
};

const ChapterContext = createContext<{
  novel: NovelInfo;
  chapter: ChapterInfo;
  setChapter: (chapter: ChapterInfo) => void;
}>(defaultValue);

export function ChapterContextProvider({
  children,
  novel,
  initialChapter,
}: {
  children: JSX.Element;
  novel: NovelInfo;
  initialChapter: ChapterInfo;
}) {
  const [chapter, setChapter] = useState(initialChapter);
  return (
    <ChapterContext.Provider
      value={{ novel: novel, chapter: chapter, setChapter: c => setChapter(c) }}
    >
      {children}
    </ChapterContext.Provider>
  );
}

export const useChapterContext = () => {
  const { novel, chapter, setChapter } = useContext(ChapterContext);
  return { novel, chapter, setChapter };
};
