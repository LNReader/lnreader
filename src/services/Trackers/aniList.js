import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { createTracker } from './index';

const apiEndpoint = 'https://graphql.anilist.co';
const clientId = '9085';
const authUrl = `https://anilist.co/api/v2/oauth/authorize?client_id=${clientId}&response_type=token`;
const redirectUri = Linking.createURL();
const searchQuery = `query($search: String!) {
  Page {
    media(search: $search, type: MANGA, format: NOVEL) {
      id
      title {
        userPreferred
      }
      coverImage {
        extraLarge
      }
    }
  }
}`;
const getListEntryQuery = `query($userId: Int!, $mediaId: Int!) {
  MediaList(userId: $userId, mediaId: $mediaId) {
    id
    status
    progress
    score
    media {
      chapters
    }
  }
}`;
const updateListEntryMutation = `mutation($id: Int!, $status: MediaListStatus, $progress: Int, $score: Int) {
  SaveMediaListEntry(mediaId: $id, status: $status, progress: $progress, scoreRaw: $score) {
    id
    status
    progress
    score
  }
}`;

export const aniListTracker = createTracker(
  {
    authenticator: async () => {
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri,
      );
      if (result.type === 'success') {
        const { url } = result;

        const keyVal = {};
        url
          .split('#')[1]
          .split('&')
          .forEach(k => {
            const split = k.split('=');
            keyVal[split[0]] = split[1];
          });
        const accessToken = keyVal.access_token;
        // The expiration date is provided in seconds, so we convert to milliseconds to construct a date
        const expiresAt = new Date(keyVal.expires_at * 1000);

        const { data } = await queryAniList(
          '{ Viewer { id } }',
          {},
          { accessToken },
        );

        return {
          accessToken,
          // AniList does not support refresh tokens.
          refreshToken: null,
          expiresAt,
          meta: {
            userId: data.Viewer.id,
          },
        };
      }
    },
    // AniList does not support refresh tokens, so we can't re-authenticate the user.
    revalidator: null,
  },
  async (search, auth) => {
    const { data } = await queryAniList(searchQuery, { search }, auth);

    return data.Page.media.map(m => {
      return {
        id: m.id,
        title: m.title.userPreferred,
        coverImage: m.coverImage.extraLarge,
      };
    });
  },
  async (id, auth) => {
    const { data } = await queryAniList(
      getListEntryQuery,
      { userId: auth.meta.userId, mediaId: id },
      auth,
    );

    return {
      status: data.MediaList?.status || 'CURRENT',
      progress: data.MediaList?.progress || 0,
      score: data.MediaList?.score || 0,
      totalChapters: data.MediaList?.media.chapters || null,
    };
  },
  async (id, payload, auth) => {
    const { data } = await queryAniList(
      updateListEntryMutation,
      {
        id,
        status: payload.status,
        progress: payload.progress,
        score: payload.score,
      },
      auth,
    );

    return {
      status: data.SaveMediaListEntry?.status || 'CURRENT',
      progress: data.SaveMediaListEntry?.progress || 0,
      score: data.SaveMediaListEntry?.score || 0,
    };
  },
);

export function mapStatus(status) {
  const map = {
    CURRENT: 'Current',
    PLANNING: 'Plan to read',
    COMPLETED: 'Completed',
    DROPPED: 'Dropped',
    PAUSED: 'Paused',
    REPEATING: 'Repeating',
  };

  return map[status];
}

/**
 * @param {string} query
 * @param {Object} variables
 * @param {import('./index').AuthenticatorResult} auth
 */
async function queryAniList(query, variables, auth) {
  const res = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${auth.accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  return res.json();
}
