import { showToast } from '@hooks/showToast';
import { SQLError, SQLTransaction } from 'expo-sqlite';

export const txnErrorCallback = (
  txnObj: SQLTransaction,
  error: SQLError,
): boolean => {
  showToast(error.message);
  return false;
};

export const txnErrorCallbackWithoutToast = (): boolean => {
  return false;
};

export const dbTxnErrorCallback = (error: SQLError): void =>
  showToast(error.message);
