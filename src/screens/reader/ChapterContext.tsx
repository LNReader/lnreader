import React, { createContext, useContext, useState } from 'react';
import { ChapterInfo, NovelInfo } from '@database/types';

const defaultValue = {} as {
  novel: NovelInfo;
  chapter: ChapterInfo;
  setChapter: (chapter: ChapterInfo) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
};

const ChapterContext = createContext<{
  novel: NovelInfo;
  chapter: ChapterInfo;
  setChapter: (chapter: ChapterInfo) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
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
  const [loading, setLoading] = useState(true);
  return (
    <ChapterContext.Provider
      value={{ novel, chapter, setChapter, loading, setLoading }}
    >
      {children}
    </ChapterContext.Provider>
  );
}

export const useChapterContext = () => {
  const { novel, chapter, setChapter, loading, setLoading } =
    useContext(ChapterContext);
  return { novel, chapter, setChapter, loading, setLoading };
};
