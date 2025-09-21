import React, { createContext, useContext } from 'react';

import { useSettings } from '@hooks/persisted/useSettings';
import { defaultSettings } from '@screens/settings/constants/defaultValues';

export type SettingsContextType = ReturnType<typeof useSettings>;

const defaultValue = defaultSettings as any as SettingsContextType;
const SettingsContext = createContext<SettingsContextType>(defaultValue);

export function SettingsContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = useSettings();

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettingsContext = (): SettingsContextType => {
  return useContext(SettingsContext);
};
