import { txnErrorCallback } from '@database/utils/helpers';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('lnreader.db');

interface RequestPackage {
  type: string;
  content: any;
  encode?: string; // 'base64', 'utf-8',
  relative_path: string;
}

export const backupCategory = () => {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Category',
        [],
        (txObj, { rows }) => {
          const requestPackage: RequestPackage = {
            type: 'Category',
            content: rows._array,
            relative_path: 'Data/Category.json',
          };
          resolve(requestPackage);
        },
        txnErrorCallback,
      );
    });
  });
};
