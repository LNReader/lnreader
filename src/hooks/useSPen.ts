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

export const useSPen = (handlers: SPenHandlers) => {
  // Handle S Pen actions directly from key events
  const handleKeyEvent = (event: KeyPressEvent) => {
    let action: SPenAction | null = null;

    // Map key strings to S Pen actions based on s_pen_actions.xml
    switch (event.key) {
      case 'ArrowRight': // DPAD_RIGHT
        action = 'NEXT_PAGE';
        break;
      case 'ArrowLeft': // DPAD_LEFT
        action = 'PREVIOUS_PAGE';
        break;
      case 'KeyN': // N key
        action = 'NEXT_CHAPTER';
        break;
      case 'KeyP': // P key
        action = 'PREVIOUS_CHAPTER';
        break;
      case 'KeyM': // M key
        action = 'TOGGLE_MENU';
        break;
      case 'Escape': // BACK key
        action = 'BACK';
        break;
    }

    if (action) {
      // Execute the appropriate handler directly
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
    }
  };

  // Use expo-key-event's useKeyEventListener hook with automatic listening
  useKeyEventListener(handleKeyEvent, true);
};
