import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useMMKVNumber } from 'react-native-mmkv';

import { appVersion } from '../utils/versionUtils';
import { showToast } from './showToast';

const LATEST_RELEASE_URL =
  'https://api.github.com/repos/LNReader/lnreader/releases/latest';

export interface NewRelease {
  tagName: string;
  changelog: string;
  downloadUrl: string;
}

const isNewVersion = (versionTag: string) => {
  const regex = /[^\\d.]/;

  const currentVersion = appVersion;
  const newVersion = versionTag.replace(regex, '');

  const newSemVer = newVersion.split('.');
  const oldSemVer = currentVersion.split('.');

  return oldSemVer?.some((version, index) => {
    if (newSemVer[index] > version) {
      return true;
    }
  });
};

export const useReleaseChecker = () => {
  const [lastChecked, setLastChecked] = useMMKVNumber('last_app_update_check');
  const [newRelease, setNewRelease] = useState<NewRelease>();

  const getNewRelease = async () => {
    try {
      if (lastChecked && dayjs(lastChecked).diff(undefined, 'hours') < 24) {
        return;
      }

      const newReleaseRes = await fetch(LATEST_RELEASE_URL);
      const newReleaseJSON = await newReleaseRes.json();

      if (isNewVersion(newReleaseJSON.tag_name)) {
        setNewRelease({
          changelog: newReleaseJSON.body,
          downloadUrl: newReleaseJSON.assets[0].browser_download_url,
          tagName: newReleaseJSON.tag_name,
        });
      }

      setLastChecked(+Date.now());
    } catch (error: any) {
      showToast(error.message);
    }
  };

  useEffect(() => {
    getNewRelease();
  }, []);

  return newRelease;
};
