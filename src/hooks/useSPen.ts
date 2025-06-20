import { useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';

export type SPenAction =
  | 'NEXT_PAGE'
  | 'PREVIOUS_PAGE'
  | 'NEXT_CHAPTER'
  | 'PREVIOUS_CHAPTER'
  | 'TOGGLE_MENU'
  | 'BACK';

interface SPenHandlers {
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  onNextChapter?: () => void;
  onPreviousChapter?: () => void;
  onToggleMenu?: () => void;
  onBack?: () => void;
}

export const useSPen = (handlers: SPenHandlers) => {
  useEffect(() => {
    const handleSPenAction = (action: SPenAction) => {
      switch (action) {
        case 'NEXT_PAGE':
          handlers.onNextPage?.();
          break;
        case 'PREVIOUS_PAGE':
          handlers.onPreviousPage?.();
          break;
        case 'NEXT_CHAPTER':
          handlers.onNextChapter?.();
          break;
        case 'PREVIOUS_CHAPTER':
          handlers.onPreviousChapter?.();
          break;
        case 'TOGGLE_MENU':
          handlers.onToggleMenu?.();
          break;
        case 'BACK':
          handlers.onBack?.();
          break;
      }
    };

    const subscription = DeviceEventEmitter.addListener('SPenAction', handleSPenAction);

    return () => {
      subscription.remove();
    };
  }, [handlers]);
};
