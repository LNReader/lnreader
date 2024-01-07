export interface DriveFile {
  kind: string;
  mimeType?: string;
  parents: string[];
  id: string;
  name: string;
  description?: string;
  createdTime?: string;
}

export interface DriveReponse {
  nextPageToken?: string;
  kind: string;
  incompleteSearch: boolean;
  files: DriveFile[];
}

export interface DriveRequestParams {
  q?: string;
  orderBy?: string;
  pageSize?: number;
  fields?: string;
  pageToken?: string;
  uploadType?: string; // only for upload
}

export interface DriveCreateRequestData {
  metadata: {
    name: string;
    mimeType: string;
    description?: string;
    parents?: string[];
  };
  content?: string; // uri if upload file
}
