import { db } from '@database/db';
import { SQLiteBindParams, SQLiteRunResult } from 'expo-sqlite';
import { noop } from 'lodash-es';

function logError(error: any) {
  // eslint-disable-next-line no-console
  console.error(error);
}

export type QueryObject = Array<
  | [string]
  | [string, SQLiteBindParams | undefined]
  | [
      string,
      SQLiteBindParams | undefined,
      ((data: SQLiteRunResult) => void) | undefined,
    ]
  | [
      string,
      SQLiteBindParams | undefined,
      ((data: SQLiteRunResult) => void) | undefined,
      ((data: any) => void) | undefined,
    ]
>;
export async function runTransaction(
  queryObject: QueryObject,
) {
  db.withTransactionAsync(async () => {
    for (const [
      query,
      params,
      callback = noop,
      catchCallback = logError,
    ] of queryObject) {
      db.runAsync(query, params ?? [])
        .then(callback)
        .catch(catchCallback);
    }
  });
}

export function runSyncTransaction(
  queryObject: QueryObject,
) {
  db.withTransactionSync(() => {
    for (const [
      query,
      params,
      callback = noop,
      catchCallback = logError,
    ] of queryObject) {
      try {
        let r = db.runSync(query, params ?? []);
        callback(r);
      } catch (error) {
        catchCallback(error);
      }
    }
  });
}

export function getAllTransaction(
  queryObject: Array<[string] | [string, SQLiteBindParams | undefined]>,
) {
  return new Promise((resolve, reject) => {
    for (const [query, params = []] of queryObject) {
      db.getAllAsync(query, params)
        .then(res => {
          resolve(res as any);
        })
        .catch(e => {
          logError(e);
          reject(e);
        });
    }
  });
}
export function getAllSync<T>(
  queryObject: Array<[string] | [string, SQLiteBindParams | undefined]>,
) {
  // let res = [];
  for (const [query, params = []] of queryObject) {
    try {
      return db.getAllSync<T>(query, params);
    } catch (e) {
      logError(e);
    }
  }
  // return res;
}

export function getFirstTransaction(
  queryObject: Array<[string] | [string, SQLiteBindParams | undefined]>,
) {
  return new Promise(resolve =>
    db.withTransactionAsync(async () => {
      for (const [query, params] of queryObject) {
        db.getFirstAsync(query, params ?? [])
          .then(res => {
            resolve(res as any);
          })
          .catch(logError);
      }
    }),
  );
}

export async function getFirstAsync(
  queryObject: [string] | [string, SQLiteBindParams | undefined],
) {
  const [query, params] = queryObject;
  return db.getFirstAsync(query, params ?? []);
}
