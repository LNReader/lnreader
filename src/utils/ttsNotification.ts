import * as Notifications from 'expo-notifications';
import { MMKVStorage } from '@utils/mmkv/mmkv';

const TTS_NOTIFICATION_ID = 'tts-control';
const TTS_ACTION_KEY = 'TTS_NOTIFICATION_ACTION';

export const updateTTSCategory = async (isPlaying: boolean) => {
  await Notifications.setNotificationCategoryAsync('TTS_CONTROLS', [
    {
      identifier: 'TTS_PLAY_PAUSE',
      buttonTitle: isPlaying ? '⏸️ Pause' : '▶️ Play',
      options: {
        opensAppToForeground: false,
      },
    },
    {
      identifier: 'TTS_STOP',
      buttonTitle: '⏹️ Stop',
      options: {
        opensAppToForeground: false,
      },
    },
    {
      identifier: 'TTS_NEXT',
      buttonTitle: '⏭️ Next',
      options: {
        opensAppToForeground: false,
      },
    },
  ]);
};

export interface TTSNotificationData {
  novelName: string;
  chapterName: string;
  isPlaying: boolean;
}

export const showTTSNotification = async (data: TTSNotificationData) => {
  await updateTTSCategory(data.isPlaying);
  await Notifications.scheduleNotificationAsync({
    identifier: TTS_NOTIFICATION_ID,
    content: {
      title: data.novelName,
      subtitle: data.chapterName,
      body: data.isPlaying ? 'Playing' : 'Paused',
      categoryIdentifier: 'TTS_CONTROLS',
      sticky: true,
      sound: false,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null,
  });
};

export const updateTTSNotification = async (data: TTSNotificationData) => {
  await updateTTSCategory(data.isPlaying);
  await Notifications.scheduleNotificationAsync({
    identifier: TTS_NOTIFICATION_ID,
    content: {
      title: data.novelName,
      subtitle: data.chapterName,
      body: data.isPlaying ? 'Playing' : 'Paused',
      categoryIdentifier: 'TTS_CONTROLS',
      sticky: true,
      sound: false,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null,
  });
};

export const dismissTTSNotification = async () => {
  await Notifications.dismissNotificationAsync(TTS_NOTIFICATION_ID);
};

export const setTTSAction = (action: string) => {
  MMKVStorage.set(TTS_ACTION_KEY, action);
};

export const getTTSAction = (): string | undefined => {
  return MMKVStorage.getString(TTS_ACTION_KEY);
};

export const clearTTSAction = () => {
  MMKVStorage.delete(TTS_ACTION_KEY);
};
