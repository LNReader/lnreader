import {useState, useEffect} from 'react';
import {appversion} from '../utils/utils';

export const useGithubUpdateChecker = () => {
  const latestReleaseUrl =
    'https://api.github.com/repos/rajarsheechatterjee/lnreader/releases/latest';

  const [checking, setChecking] = useState(true);
  const [latestRelease, setLatestRelease] = useState();

  const checkForRelease = async () => {
    let res = await fetch(latestReleaseUrl);
    res = await res.json();

    const release = {
      tag_name: res.tag_name,
      body: res.body,
      downloadUrl: res.assets[0].browser_download_url,
    };

    setLatestRelease(release);
    setChecking(false);
  };

  const isNewVersion = versionTag => {
    let currentVersion = `${appversion}`;
    const regex = /[^\\d.]/;

    let newVersion = versionTag.replace(regex, '');
    currentVersion = currentVersion;

    return newVersion !== currentVersion;
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
  }
};
