import React, { createContext, useContext } from 'react';
import {
  useLibrary,
  UseLibraryReturnType,
} from '@screens/library/hooks/useLibrary';
import { useLibrarySettings } from '@hooks/persisted';
import { LibrarySettings } from '@hooks/persisted/useSettings';

// type Library = Category & { novels: LibraryNovelInfo[] };

type LibraryContextType = UseLibraryReturnType & {
  settings: LibrarySettings;
};

const defaultValue = {} as LibraryContextType;
const LibraryContext = createContext<LibraryContextType>(defaultValue);

export function LibraryContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const useLibraryParams = useLibrary();
  const settings = useLibrarySettings();

  return (
    <LibraryContext.Provider value={{ ...useLibraryParams, settings }}>
      {children}
    </LibraryContext.Provider>
  );
}

export const useLibraryContext = (): LibraryContextType => {
  return useContext(LibraryContext);
};
