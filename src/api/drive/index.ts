import { create, list } from './request';
import { DriveCreateRequestData, FormFileObject } from './types';

const LNREADER_DRIVE_MARK = '(Do not change this!) LNReader-Drive';

export const exists = async (
  fileName: string,
  isFolder?: boolean,
  parentId?: string,
) => {
  let q = `name = '${fileName}' and fullText contains '${LNREADER_DRIVE_MARK}'`;
  if (isFolder) {
    q += " and mimeType = 'application/vnd.google-apps.folder'";
  }
  if (parentId) {
    q += ` and '${parentId}' in parents`;
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
  content: string | FormFileObject,
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
