import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  DriveCreateRequestData,
  DriveFile,
  DriveReponse,
  DriveRequestParams,
} from './types';

const BASE_URL = 'https://www.googleapis.com/drive/v3/files';
const MEDIA_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';

const buildParams = (params: DriveRequestParams) => {
  return Object.entries(params)
    .map(pair => pair.map(encodeURIComponent).join('='))
    .join('&');
};

export const list = async (
  params: DriveRequestParams,
): Promise<DriveReponse> => {
  const { accessToken } = await GoogleSignin.getTokens();

  if (!params.fields) {
    params.fields =
      'nextPageToken, files(id, name, description, createdTime, parents)';
  }

  const url = BASE_URL + '?' + buildParams(params);

  return fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  }).then(res => res.json());
};

export const create = async (
  data: DriveCreateRequestData,
): Promise<DriveFile> => {
  const { accessToken } = await GoogleSignin.getTokens();

  const params: DriveRequestParams = {
    fields: 'id, name, description, createdTime, parents',
    uploadType: 'multipart',
  };
  const url =
    (data.content ? MEDIA_UPLOAD_URL : BASE_URL) + '?' + buildParams(params);
  let body: any;

  if (data.content) {
    body = new FormData();
    body.append('metadata', {
      string: JSON.stringify(data.metadata),
      type: 'application/json',
    });
    if (data.metadata.mimeType === 'application/json') {
      body.append('media', {
        string: data.content,
        type: data.metadata.mimeType,
      });
    } else {
      body.append('media', {
        name: data.metadata.name,
        uri: data.content,
        type: data.metadata.mimeType,
      });
    }
  } else {
    body = JSON.stringify(data.metadata);
  }

  return fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
    body,
  }).then(res => res.json());
};
