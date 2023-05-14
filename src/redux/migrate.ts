import { createMigrate } from 'redux-persist';
import { malToNormalized } from '../services/Trackers/myAnimeList';

export default createMigrate({
  // Migrates old tracker data to new format
  0: migrateTrackerDataToNormalized,
});

function migrateTrackerDataToNormalized(state: any): any {
  // Migrate `tracker`
  let tracker = state.tracker;
  if (tracker) {
    tracker = {
      name: tracker.name,
      auth: {
        accessToken: tracker.access_token,
        refreshToken: tracker.refresh_token,
        expiresAt: tracker.expires_in,
        meta: undefined,
      },
    };
  }
  state.tracker = tracker;

  // Migrate `trackedNovels`
  const trackedNovels = state.trackedNovels.map((oldNovel: any) => {
    return {
      novelId: oldNovel.novelId,
      id: oldNovel.id,
      totalChapters: oldNovel.num_chapters,
      userData: {
        progress: oldNovel.my_list_status.num_chapters_read,
        score: oldNovel.my_list_status.score,
        status: malToNormalized[oldNovel.my_list_status.status],
      },
    };
  });
  state.trackedNovels = trackedNovels;

  return state;
}
