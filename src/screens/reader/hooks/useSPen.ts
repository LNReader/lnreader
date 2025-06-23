import { useKeyEventListener, KeyPressEvent } from 'expo-key-event';

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

const keyToActionMap: Record<string, SPenAction> = {
  ArrowRight: 'NEXT_PAGE',
  ArrowLeft: 'PREVIOUS_PAGE',
  KeyN: 'NEXT_CHAPTER',
  KeyP: 'PREVIOUS_CHAPTER',
  KeyM: 'TOGGLE_MENU',
  Escape: 'BACK',
};

export const useSPen = (handlers: SPenHandlers) => {
  const handleKeyEvent = (event: KeyPressEvent) => {
    const action = keyToActionMap[event.key];
    if (!action) return;

    const handlerMap: Partial<Record<SPenAction, () => void>> = {
      NEXT_PAGE: handlers.onNextPage,
      PREVIOUS_PAGE: handlers.onPreviousPage,
      NEXT_CHAPTER: handlers.onNextChapter,
      PREVIOUS_CHAPTER: handlers.onPreviousChapter,
      TOGGLE_MENU: handlers.onToggleMenu,
      BACK: handlers.onBack,
    };

    handlerMap[action]?.();
  };

  useKeyEventListener(handleKeyEvent, true);
};
