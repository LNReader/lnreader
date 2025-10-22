import { AuthenticationResult, Tracker, UserListStatus } from './index';

const baseApiUrl = 'https://api.mangaupdates.com/v1';
const contentType = 'application/vnd.api+json';

/*
 * MangaUpdates list status codes
 * These are predefined numeric codes used by the API
 */
const READING_LIST = 0;
const WISH_LIST = 1;
const COMPLETE_LIST = 2;
const UNFINISHED_LIST = 3;
const ON_HOLD_LIST = 4;

export const mangaUpdatesToNormalized: Record<number, UserListStatus> = {
  [READING_LIST]: 'CURRENT',
  [COMPLETE_LIST]: 'COMPLETED',
  [ON_HOLD_LIST]: 'PAUSED',
  [UNFINISHED_LIST]: 'DROPPED',
  [WISH_LIST]: 'PLANNING',
};

const normalizedToMangaUpdates: Record<UserListStatus, number> = {
  CURRENT: READING_LIST,
  COMPLETED: COMPLETE_LIST,
  PAUSED: ON_HOLD_LIST,
  DROPPED: UNFINISHED_LIST,
  PLANNING: WISH_LIST,
  REPEATING: READING_LIST,
};

export async function authenticateWithCredentials(
  username: string,
  password: string,
): Promise<AuthenticationResult> {
  const loginUrl = `${baseApiUrl}/account/login`;
  const loginResponse = await fetch(loginUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (loginResponse.status !== 200) {
    const error = await loginResponse.json().catch(() => ({}));
    throw new Error(error.message || 'Invalid username or password');
  }

  const loginData = await loginResponse.json();
  const sessionToken = loginData.context?.session_token;

  if (!sessionToken) {
    throw new Error('Failed to obtain session token');
  }

  return {
    accessToken: sessionToken,
    refreshToken: undefined,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  };
}

export const mangaUpdatesTracker: Tracker = {
  authenticate: async () => {
    /*
     * Authentication is handled by authenticateWithCredentials
     * which is called from the login dialog in settings
     */
    throw new Error(
      'Please use the login dialog to authenticate with MangaUpdates',
    );
  },

  revalidate: async auth => {
    const response = await fetch(`${baseApiUrl}/account/profile`, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });

    if (response.status === 200) {
      return auth;
    }

    throw 'Session expired, please re-authenticate';
  },

  handleSearch: async search => {
    const searchUrl = `${baseApiUrl}/series/search`;
    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
      },
      body: JSON.stringify({
        search,
        filter_types: ['drama cd', 'novel'],
      }),
    });

    if (response.status !== 200) {
      return [];
    }

    const data = await response.json();
    return (data.results || []).map((item: any) => ({
      id: item.record.series_id,
      title: item.record.title,
      coverImage: item.record.image?.url?.original || '',
      totalChapters: undefined,
    }));
  },

  getUserListEntry: async (id, auth) => {
    try {
      const listResponse = await fetch(`${baseApiUrl}/lists/series/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      });

      let status: UserListStatus = 'CURRENT';
      let progress = 0;

      if (listResponse.status === 200) {
        const listData = await listResponse.json();
        status = mangaUpdatesToNormalized[listData.list_id] || 'CURRENT';
        progress = listData.status?.chapter || 0;
      }

      /* Rating is stored separately from list status */
      let score = 0;
      try {
        const ratingResponse = await fetch(
          `${baseApiUrl}/series/${id}/rating`,
          {
            headers: {
              Authorization: `Bearer ${auth.accessToken}`,
            },
          },
        );

        if (ratingResponse.status === 200) {
          const ratingData = await ratingResponse.json();
          score = ratingData.rating || 0;
        }
      } catch (e) {
        /* Rating might not exist yet */
      }

      return {
        status,
        progress,
        score,
      };
    } catch (error) {
      return {
        status: 'CURRENT',
        progress: 0,
        score: 0,
      };
    }
  },

  updateUserListEntry: async (id, payload, auth) => {
    const statusCode = payload.status
      ? normalizedToMangaUpdates[payload.status]
      : normalizedToMangaUpdates.CURRENT;

    try {
      const updateBody = [
        {
          series: {
            id: Number(id),
          },
          list_id: statusCode,
          status: {
            chapter: Math.round(payload.progress || 0),
          },
        },
      ];

      let updateResponse = await fetch(`${baseApiUrl}/lists/series/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.accessToken}`,
          'Content-Type': contentType,
        },
        body: JSON.stringify(updateBody),
      });

      /*
       * If update fails, the series might not be in the list yet.
       * Add it first, then retry the update.
       */
      if (updateResponse.status !== 200) {
        const addBody = [
          {
            series: {
              id: Number(id),
            },
            list_id: statusCode,
          },
        ];

        const addResponse = await fetch(`${baseApiUrl}/lists/series`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${auth.accessToken}`,
            'Content-Type': contentType,
          },
          body: JSON.stringify(addBody),
        });

        if (addResponse.status === 200) {
          updateResponse = await fetch(`${baseApiUrl}/lists/series/update`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${auth.accessToken}`,
              'Content-Type': contentType,
            },
            body: JSON.stringify(updateBody),
          });
        }
      }

      /* Rating is updated separately from list status */
      if (payload.score !== undefined) {
        if (payload.score > 0) {
          await fetch(`${baseApiUrl}/series/${id}/rating`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${auth.accessToken}`,
              'Content-Type': contentType,
            },
            body: JSON.stringify({
              rating: payload.score,
            }),
          });
        } else {
          await fetch(`${baseApiUrl}/series/${id}/rating`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${auth.accessToken}`,
            },
          });
        }
      }

      return {
        status: payload.status || 'CURRENT',
        progress: Math.round(payload.progress || 0),
        score: payload.score !== undefined ? payload.score : 0,
      };
    } catch (error) {
      throw new Error('Failed to update MangaUpdates entry');
    }
  },
};
