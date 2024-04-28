import * as SQLite from 'expo-sqlite';

import { Repository } from '@database/types';

import { txnErrorCallback } from '../utils/helpers';
import { noop } from 'lodash-es';

const db = SQLite.openDatabase('lnreader.db');

const getRepositoriesQuery = 'SELECT * FROM Repository';

export const getRepositoriesFromDb = async (): Promise<Repository[]> => {
  return new Promise(resolve =>
    db.transaction(tx => {
      tx.executeSql(
        getRepositoriesQuery,
        [],
        (txObj, { rows }) => resolve((rows as any)._array),
        txnErrorCallback,
      );
    }),
  );
};

const isRepoUrlDuplicateQuery = `
  SELECT COUNT(*) as isDuplicate FROM Repository WHERE url = ?
	`;

export const isRepoUrlDuplicate = (repoUrl: string): Promise<boolean> => {
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

export const createRepository = (repoUrl: string): void =>
  db.transaction(tx =>
    tx.executeSql(createRepositoryQuery, [repoUrl], noop, txnErrorCallback),
  );

const deleteRepositoryQuery = 'DELETE FROM Repository WHERE id = ?';

export const deleteRepositoryById = (id: number): void => {
  db.transaction(tx => {
    tx.executeSql(deleteRepositoryQuery, [id], noop, txnErrorCallback);
  });
};

const updateRepositoryQuery = 'UPDATE Repository SET name = ? WHERE id = ?';

export const updateRepository = (id: number, url: string): void =>
  db.transaction(tx =>
    tx.executeSql(updateRepositoryQuery, [url, id], noop, txnErrorCallback),
  );
