import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase('lnreader.db');

const getUpdatesQuery = `
    SELECT chapters.chapterId, chapters.read, chapters.downloaded, chapters.chapterUrl, chapters.chapterName, novels.novelUrl, novels.novelId, novels.novelCover, novels.novelName, novels.sourceId, updates.updateTime, updates.updateId
    FROM updates 
    JOIN chapters 
    ON updates.chapterId = chapters.chapterId
    JOIN novels
    ON updates.novelId = novels.novelId
    WHERE date(updates.updateTime) > date('now','-3 months')
    ORDER BY updates.updateTime DESC
    LIMIT 100
    `;

export const getUpdates = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        getUpdatesQuery,
        null,
        (txObj, {rows: {_array}}) => {
          resolve(_array);
        },
        (txObj, error) => console.log('Error ', error),
      );
    });
  });
};

export const deleteNovelUpdates = novelId => {
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM updates WHERE novelId = ?',
      [novelId],
      (txObj, res) => {},
      (txObj, error) => console.log('Error ', error),
    );
  });
};

export const clearUpdates = () =>
  db.transaction(tx => tx.executeSql('DELETE FROM updates; VACCUM;'));
