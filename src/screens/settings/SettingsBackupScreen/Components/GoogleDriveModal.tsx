import React from 'react';
import { ThemeColors } from '@theme/types';
import { StyleSheet, Text, View } from 'react-native';
import { Modal, overlay } from 'react-native-paper';
import { GoogleSignin, User } from '@react-native-google-signin/google-signin';
import { useEffect, useState } from 'react';
import { Button } from '@components';
import FastImage from 'react-native-fast-image';
import { TouchableOpacity } from 'react-native-gesture-handler';
import * as Clipboard from 'expo-clipboard';
import { showToast } from '@hooks/showToast';

interface GoogleDriveModalProps {
  visible: boolean;
  theme: ThemeColors;
  closeModal: () => void;
}

export default function GoogleDriveModal({
  visible,
  theme,
  closeModal,
}: GoogleDriveModalProps) {
  const [user, setUser] = useState<User | null | undefined>(null);
  const [loading, setLoading] = useState(true);
  const signOut = () => {
    GoogleSignin.signOut()
      .then(() => {
        setUser(null);
      })
      .catch((error: any) => {
        console.log(error);
      });
  };
  const signIn = () => {
    GoogleSignin.hasPlayServices()
      .then(hasPlayServices => {
        if (hasPlayServices) {
          return GoogleSignin.signIn();
        }
      })
      .then(user => {
        setUser(user);
      })
      .catch((error: any) => {
        console.log(error);
      });
  };
  useEffect(() => {
    GoogleSignin.configure({
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    GoogleSignin.isSignedIn()
      .then(isSignedIn => {
        if (isSignedIn) {
          return GoogleSignin.getCurrentUser();
        } else {
          setLoading(false);
        }
      })
      .then(user => {
        setUser(user);
        setLoading(false);
      });
  }, []);

  return (
    <Modal
      visible={visible}
      onDismiss={closeModal}
      contentContainerStyle={[
        styles.modalContainer,
        { backgroundColor: overlay(2, theme.surface) },
      ]}
    >
      {loading ? null : (
        <>
          <View style={styles.titleContainer}>
            <Text style={[styles.modalTitle, { color: theme.onSurface }]}>
              Google Drive Backup
            </Text>
            <TouchableOpacity
              onLongPress={() => {
                if (user?.user.email) {
                  Clipboard.setStringAsync(user.user.email).then(success => {
                    if (success) {
                      showToast('Copied to clipboard: ' + user.user.email);
                    }
                  });
                }
              }}
            >
              <FastImage
                source={{ uri: user?.user.photo || '' }}
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View>
          {user ? (
            <>
              <Button
                title="Backup"
                style={[styles.btnOutline, { borderColor: theme.outline }]}
              />
              <Button
                title="Restore"
                style={[styles.btnOutline, { borderColor: theme.outline }]}
              />
              <Button
                title="Sign out"
                style={[styles.btnOutline, { borderColor: theme.outline }]}
                onPress={signOut}
              />
            </>
          ) : (
            <Button
              title="Sign in"
              style={[styles.btnOutline, { borderColor: theme.outline }]}
              onPress={signIn}
            />
          )}
        </>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    margin: 30,
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderRadius: 32,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlignVertical: 'center',
    marginBottom: 16,
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 40,
  },
  modalTitle: {
    fontSize: 24,
  },
  btnContainer: {
    marginTop: 24,
    flexDirection: 'row-reverse',
  },
  btnOutline: {
    marginVertical: 4,
    borderWidth: 1,
  },
});
