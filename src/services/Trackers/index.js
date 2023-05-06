import { aniListTracker } from './aniList';
import { myAnimeListTracker } from './myAnimeList';

/**
 * @typedef {Object} Tracker
 * @property {AuthenticationStrategy} authStrategy
 * @property {TrackerSearch} searchHandler
 * @property {UserListFinder} listFinder
 * @property {ListUpdater} listUpdater
 *
 * @typedef {Object} AuthenticationStrategy
 * @property {() => Promise<AuthenticatorResult>} authenticator Handles the full flow of logging the user in
 * @property {(auth: AuthenticatorResult) => Promise<AuthenticatorResult>?} revalidator
 * Handles re-authenticating the user when their token expires. If not available, the user authentication will be removed.
 *
 * @typedef {Object} AuthenticatorResult
 * @property {string} accessToken The user's authentication token
 * @property {string?} refreshToken The token used for obtaining a new accessToken
 * @property {Date} expiresAt When the token expires
 * @property {Object | undefined} meta Additional data this tracker may need to store
 *
 * @typedef {Object} SearchResult
 * @property {number | string} id The unique ID of this entry
 * @property {string} title The title of this entry
 * @property {string} coverImage A cover image for this entry
 *
 * @typedef {Object} UserListEntry
 * @property {string} status The user's current status
 * @property {number} progress The user's current chapter progress
 * @property {number?} totalChapters The total chapters for this entry. May not be known by the tracker
 * @property {number} score The user's current score
 *
 * @callback TrackerSearch
 * @param {string} search The search query
 * @param {AuthenticatorResult} authentication The user's authentication information
 * @return {Promise<SearchResult[]>}
 *
 * @callback UserListFinder
 * @param {number | string} id The tracker's unique ID
 * @param {AuthenticatorResult} authentication The user's authentication information
 * @return {Promise<UserListEntry>}
 *
 * @callback ListUpdater
 * @param {number | string} id The tracker's unique ID
 * @param {UserListEntry} payload The list changes to submit
 * @param {AuthenticatorResult} authentication The user's authentication information
 * @return {Promise<UserListEntry>} The updated result from the server
 */

/**
 * Convenience method to create a shaped Tracker object.
 *
 * @param {AuthenticationStrategy} authStrategy
 * @param {TrackerSearch} searchHandler
 * @param {UserListFinder} listFinder
 * @param {ListUpdater} listUpdater
 * @returns {Tracker}
 */
export function createTracker(
  authStrategy,
  searchHandler,
  listFinder,
  listUpdater,
) {
  return {
    authStrategy,
    searchHandler,
    listFinder,
    listUpdater,
  };
}

/**
 * A convenience method for getting a tracker by name.
 *
 * @param {"MyAnimeList" | "AniList"} trackerName The name of the current tracker
 * @returns {Tracker}
 */
export function getTracker(trackerName) {
  switch (trackerName) {
    case 'AniList':
      return aniListTracker;
    case 'MyAnimeList':
      return myAnimeListTracker;
  }
}
