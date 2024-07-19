import { Repository } from '@database/types';

import { txnErrorCallback } from '../utils/helpers';
import { noop } from 'lodash-es';
import getDb from '@database/openDB';

const getRepositoriesQuery = 'SELECT * FROM Repository';

export const getRepositoriesFromDb = async (): Promise<Repository[]> => {
  const db = await getDb();
  console.log(db);

  return new Promise(resolve =>
    db.transaction(
      tx => {
        tx.executeSql(
          getRepositoriesQuery,
          [],
          (txObj, { rows }) => resolve((rows as any)._array),
          txnErrorCallback,
        );
      },
      e => console.error(e),
    ),
  );
};

const isRepoUrlDuplicateQuery = `
  SELECT COUNT(*) as isDuplicate FROM Repository WHERE url = ?
	`;

export const isRepoUrlDuplicate = async (repoUrl: string): Promise<boolean> => {
  const db = await getDb();
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        isRepoUrlDuplicateQuery,
        [repoUrl],
        (txObj, { rows }) => {
          const { _array } = rows as any;
          resolve(Boolean(_array[0]?.isDuplicate));
        },
        txnErrorCallback,
      );
    }),
  );
};

const createRepositoryQuery = 'INSERT INTO Repository (url) VALUES (?)';

export const createRepository = async (repoUrl: string): Promise<void> => {
  const db = await getDb();
  db.transaction(tx =>
    tx.executeSql(createRepositoryQuery, [repoUrl], noop, txnErrorCallback),
  );
};

const deleteRepositoryQuery = 'DELETE FROM Repository WHERE id = ?';

export const deleteRepositoryById = async (id: number) => {
  const db = await getDb();
  db.transaction(tx => {
    tx.executeSql(deleteRepositoryQuery, [id], noop, txnErrorCallback);
  });
};

const updateRepositoryQuery = 'UPDATE Repository SET name = ? WHERE id = ?';

export const updateRepository = async (id: number, url: string) => {
  const db = await getDb();
  db.transaction(tx =>
    tx.executeSql(updateRepositoryQuery, [url, id], noop, txnErrorCallback),
  );
};
