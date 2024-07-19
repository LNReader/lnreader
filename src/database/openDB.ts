import * as SQLite from 'expo-sqlite/legacy';

const dbName = 'lnreader.db';
let db: null | SQLite.SQLiteDatabase = null;
export default function getDb() {
  if (db !== null) {
    console.log('returned saved db');

    return db;
  }
  console.log('created new db');

  db = SQLite.openDatabase(dbName, '3.0');
  return db;
}
