import React, { createContext, useContext, useMemo, useRef } from 'react';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDeviceOrientation } from '@hooks/index';

type HeightContextType = {
  navigationBarHeight: number;
  statusBarHeight: number;
};

const HeightContext = createContext<HeightContextType | null>(null);

export function HeightContextProvider({
  children,
}: {
  children: React.JSX.Element;
}) {
  const { bottom, top } = useSafeAreaInsets();
  const orientation = useDeviceOrientation();
  const NavigationBarHeight = useRef(bottom);
  const StatusBarHeight = useRef(top);

  if (bottom < NavigationBarHeight.current && orientation === 'landscape') {
    NavigationBarHeight.current = bottom;
  } else if (bottom > NavigationBarHeight.current) {
    NavigationBarHeight.current = bottom;
  }
  if (top > StatusBarHeight.current) {
    StatusBarHeight.current = top;
  }
  const contextValue = useMemo(
    () => ({
      navigationBarHeight: NavigationBarHeight.current,
      statusBarHeight: StatusBarHeight.current,
    }),
    [],
  );
  return (
    <HeightContext.Provider value={contextValue}>
      {children}
    </HeightContext.Provider>
  );
}

export const useHeightContext = () => {
  const context = useContext(HeightContext);
  if (!context) {
    throw new Error(
      'useHeightContext must be used within HeightContextProvider',
    );
  }
  return context;
};
