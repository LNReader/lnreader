import { db } from '@database/db';
import { SQLiteBindParams, SQLiteRunResult } from 'expo-sqlite';
import { noop } from 'lodash-es';

function logError(error: any) {
  // eslint-disable-next-line no-console
  console.error(error);
}

type query = string;
type SQLiteResultFunction<T> = (data: T) => void;
type SQLiteErrorFunction = (data: any) => void;

export type QueryObject<T = unknown> =
  | [query, SQLiteBindParams, SQLiteResultFunction<T>, SQLiteErrorFunction]
  | [query, SQLiteBindParams, SQLiteResultFunction<T>]
  | [query, SQLiteBindParams]
  | [query];

function defaultQuerySync<T = unknown, Array extends boolean = false>(
  fn: 'getAllSync' | 'getFirstSync' | 'runSync',
  queryObject: QueryObject<Array extends true ? T[] : T>,
  errorReturn: Array extends true ? [] : null,
) {
  const [query, params = [], callback = noop, catchCallback = logError] =
    queryObject;

  try {
    // @ts-ignore
    const result = db[fn](query, params) as Array extends true ? T[] : T;
    callback(result);
    return result;
  } catch (e) {
    catchCallback(e);
    return errorReturn;
  }
}
async function defaultQueryAsync<T = unknown, Array extends boolean = false>(
  fn: 'getAllAsync' | 'getFirstAsync' | 'runAsync',
  queryObject: QueryObject<Array extends true ? T[] : T>,
  errorReturn: Array extends true ? [] : null,
) {
  const [query, params = [], callback = noop, catchCallback = logError] =
    queryObject;

  try {
    // @ts-ignore
    const result = (await db[fn](query, params)) as Array extends true
      ? T[]
      : T;
    callback(result);
    return result;
  } catch (e) {
    catchCallback(e);
    return errorReturn;
  }
}

export async function runAsync(queryObjects: QueryObject<SQLiteRunResult>[]) {
  for (const queryObject of queryObjects) {
    defaultQueryAsync<SQLiteRunResult, false>('runAsync', queryObject, null);
  }
}

export function runSync(queryObjects: QueryObject<SQLiteRunResult>[]) {
  for (const queryObject of queryObjects) {
    defaultQuerySync<SQLiteRunResult, false>('runSync', queryObject, null);
  }
}

export async function getAllAsync<T = unknown>(queryObject: QueryObject<T[]>) {
  return defaultQueryAsync<T, true>('getAllAsync', queryObject, []);
}
export function getAllSync<T = unknown>(queryObject: QueryObject<T[]>) {
  return defaultQuerySync<T, true>('getAllSync', queryObject, []);
}

export function getFirstAsync<T = unknown>(queryObject: QueryObject<T>) {
  return defaultQueryAsync<T, false>('getFirstAsync', queryObject, null);
}
