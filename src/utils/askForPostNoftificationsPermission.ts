import { PermissionsAndroid, Platform } from 'react-native';

export async function askForPostNotificationsPermission(): Promise<boolean> {
  if (Platform.OS !== 'android' || Platform.Version < 33) return true;

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      {
        title: 'Notification Permission',
        message: 'We need your permission to show you notifications',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.info('Permission Granted. You can now receive notifications.');
      return true;
    } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
      console.warn('Permission Denied. Notification permission is required.');
    } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      console.warn(
        'Permission Blocked. Notification permission has been blocked.',
      );
    }
  } catch (e) {
    console.warn('requestPostNotificationsPermission error', e);
  }
  return false;
}
