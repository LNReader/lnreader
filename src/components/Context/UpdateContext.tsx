import { useUpdates } from '@hooks/persisted';
import React, { createContext, useContext, useMemo } from 'react';

type UpdateContextType = ReturnType<typeof useUpdates>;

const defaultValue = {} as UpdateContextType;
const UpdateContext = createContext<UpdateContextType>(defaultValue);

export function UpdateContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const useUpdateParams = useUpdates();
  const contextValue = useMemo(
    () => ({
      ...useUpdateParams,
    }),
    [useUpdateParams],
  );

  return (
    <UpdateContext.Provider value={contextValue}>
      {children}
    </UpdateContext.Provider>
  );
}

export const useUpdateContext = (): UpdateContextType => {
  return useContext(UpdateContext);
};
