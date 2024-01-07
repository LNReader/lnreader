import { PATH_SEPARATOR } from '@api/constants';
import { BackupPackage } from '@services/backup/types';
import { AppDownloadFolder } from '@utils/constants/download';
import { downloadFile, mkdir } from 'react-native-fs';

const commonHeaders = {
  'Connection': 'keep-alive',
  'Accept':
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br',
};

export const upload = (host: string, data: BackupPackage) => {
  const url = host + '/' + 'upload';
  const body = new FormData();
  data.name = data.name.replace(/\//g, PATH_SEPARATOR);
  body.append('metadata', JSON.stringify(data));
  if (data.mimeType === 'application/json') {
    body.append('media', {
      string: data.content,
      type: data.mimeType,
    });
  } else {
    body.append('media', {
      name: data.name,
      uri: data.content,
      type: data.mimeType,
    });
  }
  return fetch(url, {
    method: 'POST',
    headers: commonHeaders,
    body,
  });
};

export const list = (host: string, folderTree: string[]): Promise<string[]> => {
  const url = host + '/' + 'list';
  const body = new FormData();
  body.append('metadata', JSON.stringify({ folderTree }));

  return fetch(url, {
    method: 'POST',
    headers: commonHeaders,
    body,
  }).then(res => res.json());
};

export const getJson = (host: string, folderTree: string[], name: string) => {
  const url = host + '/' + 'download' + '/' + folderTree.join('/') + '/' + name;
  return fetch(url, {
    headers: commonHeaders,
  }).then(res => res.json());
};

export const download = async (
  host: string,
  folderTree: string[],
  name: string,
) => {
  const url = host + '/' + 'download' + '/' + folderTree.join('/') + '/' + name;
  const regex = new RegExp(`${PATH_SEPARATOR}`, 'g');
  const filePath = AppDownloadFolder + '/' + name.replace(regex, '/');
  const dirPath = filePath.split('/').slice(0, -1).join('/');
  await mkdir(dirPath).then(() => {
    return downloadFile({
      fromUrl: url,
      toFile: filePath,
      headers: commonHeaders,
    }).promise;
  });
};

export const exists = (
  host: string,
  folderTree: string[],
  name: string,
): Promise<boolean> => {
  const url = host + '/' + 'exists';
  const body = new FormData();
  body.append('metadata', JSON.stringify({ folderTree, name }));
  return fetch(url, {
    method: 'POST',
    headers: commonHeaders,
    body,
  })
    .then(res => res.json())
    .then(data => data.exists);
};
