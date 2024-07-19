import { showToast } from '@utils/showToast';
import { SQLError, SQLTransaction } from 'expo-sqlite/legacy';

export const txnErrorCallback = (
  txn: SQLTransaction,
  error: SQLError,
): boolean => {
  console.log('txnError');

  showToast(error.message);
  return false;
};

export const txnErrorCallbackWithoutToast = (error: SQLError): boolean => {
  error;
  return false;
};

export const dbTxnErrorCallback = (error: SQLError): void =>
  showToast(error.message);
