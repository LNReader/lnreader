import { PATH_SEPARATOR } from '@api/constants';
import ZipArchive from '@native/ZipArchive';
import { fetchTimeout } from '@utils/fetch/fetch';

const commonHeaders = {
  'Connection': 'keep-alive',
  'Accept':
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br',
};

export const upload = (
  host: string,
  backupFolder: string,
  filename: string,
  sourceDirPath: string,
) => {
  const url = `${host}/upload/${backupFolder}${PATH_SEPARATOR}${filename}`;
  console.log(url);

  return ZipArchive.remoteZip(sourceDirPath, url, {});
};

export const list = (host: string, folderTree: string[]): Promise<string[]> => {
  const url = host + '/' + 'list';
  const body = new FormData();
  body.append('metadata', JSON.stringify({ folderTree }));

  return fetchTimeout(url, {
    method: 'POST',
    headers: commonHeaders,
    body,
  }).then(res => res.json());
};

export const download = async (
  host: string,
  backupFolder: string,
  filename: string,
  distDirPath: string,
) => {
  const url = `${host}/download/${backupFolder}${PATH_SEPARATOR}${filename}`;
  return ZipArchive.remoteUnzip(distDirPath, url, {});
};
