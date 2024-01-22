import { useState, useEffect } from 'react';
import { appVersion } from '../../utils/versionUtils';
import { newer } from '@utils/compareVersion';

interface GithubUpdate {
  isNewVersion: boolean;
  latestRelease: any;
}

export const useGithubUpdateChecker = (): GithubUpdate => {
  const latestReleaseUrl =
    'https://api.github.com/repos/rajarsheechatterjee/lnreader/releases/latest';

  const [checking, setChecking] = useState(true);
  const [latestRelease, setLatestRelease] = useState<any>();

  const checkForRelease = async () => {
    const res = await fetch(latestReleaseUrl);
    const data = await res.json();

    const release = {
      tag_name: data.tag_name,
      body: data.body,
      downloadUrl: data.assets[0].browser_download_url,
    };

    setLatestRelease(release);
    setChecking(false);
  };

  const isNewVersion = (versionTag: string) => {
    let currentVersion = `${appVersion}`;
    const regex = /[^\\d.]/;

    let newVersion = versionTag.replace(regex, '');

    return newer(newVersion, currentVersion);
  };

  useEffect(() => {
    checkForRelease();
    // .catch(e => {
    //   showToast(`Could not connect to github:\n${`${e}`.split(':')[1].trim()}`);
    //   // console.error(e);
    // });
  }, []);

  if (!checking) {
    const data = {
      latestRelease,
      isNewVersion: isNewVersion(latestRelease.tag_name),
    };

    return data;
  } else {
    return {
      latestRelease: undefined,
      isNewVersion: false,
    };
  }
};
