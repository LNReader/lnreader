import { showToast } from '@hooks/showToast';
import { SQLError, SQLTransaction } from 'expo-sqlite';

export const txnErrorCallback = (
  txn: SQLTransaction,
  error: SQLError,
): boolean => {
  showToast(error.message);
  return false;
};

export const txnErrorCallbackWithoutToast = (error: SQLError): boolean => {
  error;
  return false;
};

export const dbTxnErrorCallback = (error: SQLError): void =>
  showToast(error.message);
