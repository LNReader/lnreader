import React, { createContext, useContext } from 'react';
import { Category, LibraryNovelInfo, NovelInfo } from '@database/types';
import {
  ExtendedCategory,
  useLibrary,
} from '@screens/library/hooks/useLibrary';
import { useLibrarySettings } from '@hooks/persisted';
import { LibrarySettings } from '@hooks/persisted/useSettings';

type Library = Category & { novels: LibraryNovelInfo[] };

type LibraryContextType = {
  library: NovelInfo[];
  categories: ExtendedCategory[];
  refetchLibrary: () => void;
  isLoading: boolean;
  settings: LibrarySettings;
};

const defaultValue = {} as LibraryContextType;
const LibraryContext = createContext<LibraryContextType>(defaultValue);

export function LibraryContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { library, categories, refetchLibrary, isLoading } = useLibrary();
  const settings = useLibrarySettings();

  return (
    <LibraryContext.Provider
      value={{ library, categories, refetchLibrary, isLoading, settings }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export const useLibraryContext = () => {
  return useContext(LibraryContext);
};
