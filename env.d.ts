declare module '@env' {
  export const MYANIMELIST_CLIENT_ID: string;
  export const ANILIST_CLIENT_ID: string;
  export const GIT_HASH: string;
  export const RELEASE_DATE: string;
  export const BUILD_TYPE: 'Debug' | 'Release' | 'Beta' | 'Github Action';
}
