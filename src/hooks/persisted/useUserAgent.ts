import { MMKVStorage } from '@utils/mmkv/mmkv';
import { useMMKVString } from 'react-native-mmkv';
import { getUserAgentSync } from 'react-native-device-info';

export const USER_AGENT = 'USER_AGENT';

export const getUserAgent = () => {
  return MMKVStorage.getString(USER_AGENT) || getUserAgentSync();
};

export default function useUserAgent() {
  const [userAgent = getUserAgentSync(), setUserAgent] =
    useMMKVString(USER_AGENT);

  return {
    userAgent,
    setUserAgent,
  };
}
