import { create, download, getJson, list } from './request';
import { DriveCreateRequestData, DriveFile } from './types';

const LNREADER_DRIVE_MARK = '(Do not change this!) LNReader-Drive';

export const exists = async (
  fileName: string,
  isFolder?: boolean,
  parentId?: string,
  marked?: boolean,
) => {
  let q = `name = '${fileName}' and trashed = false `;
  if (marked) {
    q += ` and fullText contains '${LNREADER_DRIVE_MARK}' `;
  }
  if (isFolder) {
    q += " and mimeType = 'application/vnd.google-apps.folder' ";
  }
  if (parentId) {
    q += ` and '${parentId}' in parents `;
  }
  const res = await list({ q });
  return res.files.find(file => file.name === fileName);
};

export const makeDir = async (fileName: string, parentId?: string) => {
  const existedDir = await exists(fileName, true, parentId);
  if (existedDir) {
    return existedDir;
  }
  const data: DriveCreateRequestData = {
    metadata: {
      name: fileName,
      mimeType: 'application/vnd.google-apps.folder',
      description: LNREADER_DRIVE_MARK,
    },
  };
  if (parentId) {
    data.metadata.parents = [parentId];
  }
  return create(data);
};

export const createFile = async (
  fileName: string,
  mimeType: string,
  content: string,
  parentId?: string,
) => {
  const existedFile = await exists(fileName, false, parentId);
  if (existedFile) {
    return existedFile;
  }
  const data: DriveCreateRequestData = {
    metadata: {
      name: fileName,
      mimeType: mimeType,
      description: LNREADER_DRIVE_MARK,
    },
    content: content,
  };
  if (parentId) {
    data.metadata.parents = [parentId];
  }
  return create(data);
};

export const getBackups = async (parentId: string, marked?: boolean) => {
  let q = `
      name contains '.backup' and trashed = false
      and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents 
    `;
  if (marked) {
    q += ` and fullText contains '${LNREADER_DRIVE_MARK}' `;
  }
  return list({
    q,
  }).then(res => res.files);
};

export const readDir = async (parentId: string, marked?: boolean) => {
  let fileList: DriveFile[] = [];
  let pageToken = '';
  let q = `
    trashed = false and mimeType != 'application/vnd.google-apps.folder' 
    and '${parentId}' in parents 
  `;
  if (marked) {
    q += ` and fullText contains '${LNREADER_DRIVE_MARK}' `;
  }
  let hasNextPage = true;
  while (hasNextPage) {
    const query = pageToken ? q + ` and pageToken = '${pageToken}'` : q;
    const { nextPageToken, files } = await list({ q: query });
    if (!nextPageToken) {
      hasNextPage = false;
    } else {
      pageToken = nextPageToken;
    }
    fileList = fileList.concat(files);
  }
  return fileList;
};

export const readFile = async (file: DriveFile, type: 'json' | 'media') => {
  if (type === 'json') {
    return getJson(file.id);
  } else {
    return download(file);
  }
};
