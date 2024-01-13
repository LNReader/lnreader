export type TrackerName = 'AniList' | 'MyAnimeList';
/**
 * Normalized list status values.
 * Not all trackers will use all of these.
 * Trackers should remap them when getting/sending them to the server
 */
export type UserListStatus =
  | 'CURRENT'
  | 'PLANNING'
  | 'COMPLETED'
  | 'DROPPED'
  | 'PAUSED'
  | 'REPEATING';

export type AuthenticationResult<Meta = Record<string, any>> = {
  /** The token used to authenticate with the tracker's API */
  accessToken: string;
  /** A token used to refresh the access token. Not supported by all trackers */
  refreshToken?: string;
  /** The time at which the access token expires and must be refreshed if possible */
  expiresAt: Date;
  /** Used to store any needed additional metadata */
  meta?: Meta;
};

export type SearchResult = {
  /** The tracker's unique ID of this entry */
  id: string | number;
  /** The tracker's title of this entry */
  title: string;
  /** A link to the tracker's largest available image for this entry */
  coverImage: string;
  /** The total number of chapters for this entry which may not be available */
  totalChapters?: number;
};

export type UserListEntry = {
  /** The user's current reading status */
  status: UserListStatus;
  /** The user's current chapter progress */
  progress: number;
  /** The user's current score */
  score: number;
};

export type Tracker<AuthMeta = any> = {
  /**
   * Handles the full flow of logging the user in.
   *
   * @returns User authentication credentials
   */
  authenticate: () => Promise<AuthenticationResult<AuthMeta>>;
  /**
   * Automated re-authentication for trackers that support it. If the tracker doesn't support it, the
   * authentication data will be removed, effectively logging the user out.
   *
   * @param auth The current authentication credentials.
   * @returns Refreshed authentication credentials.
   */
  revalidate?: (
    auth: AuthenticationResult<AuthMeta>,
  ) => Promise<AuthenticationResult<AuthMeta>>;

  /**
   * Searches the tracker and returns the results in a normalized format.
   *
   * @param search The search query
   * @param authentication The user's authentication credentials
   * @returns A normalized array of results from the tracker.
   */
  handleSearch: (
    search: string,
    authentication: AuthenticationResult<AuthMeta>,
  ) => Promise<SearchResult[]>;

  /**
   * Gets the user's list entry from the tracker service. If no list entry is found, it should
   * be created with relevant default values and those should be returned instead.
   *
   * @param id The tracker's unique ID
   * @param authentication The user's authentication credentials
   * @returns The user's list entry information
   */
  getUserListEntry: (
    id: number | string,
    authentication: AuthenticationResult<AuthMeta>,
  ) => Promise<UserListEntry>;

  /**
   * Converts the normalized list entry to the tracker's necessary format and submits it to the
   * tracker.
   *
   * @param id The tracker's unique ID
   * @param payload The list entry updates to send to the tracker
   * @param authentication The user's authentication credentials
   * @returns The updated list entry as determined by the tracker
   */
  updateUserListEntry: (
    id: number | string,
    payload: Partial<UserListEntry>,
    authentication: AuthenticationResult<AuthMeta>,
  ) => Promise<UserListEntry>;
};
