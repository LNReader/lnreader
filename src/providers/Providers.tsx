import React from 'react';
import { ThemeContextProvider } from './context/ThemeContext';
import { QueueContextProvider } from './context/QueueContext';

export { useTheme } from './context/ThemeContext';
export { useQueue } from './context/QueueContext';

export function Providers({ children }: { children: React.JSX.Element }) {
  return (
    <ThemeContextProvider>
      <QueueContextProvider>{children}</QueueContextProvider>
    </ThemeContextProvider>
  );
}
