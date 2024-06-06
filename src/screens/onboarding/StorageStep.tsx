import React, { useEffect, useState } from 'react';
import { useTheme } from '@hooks/persisted';
import { PermissionsAndroid, StyleSheet, View } from 'react-native';
import { Button } from '@components';
import FileManager from '@native/FileManager';
import { showToast } from '@utils/showToast';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface StorageStepProps {
  rootStorage: string;
  onPathChange: (path: string) => void;
}

export default function StorageStep({
  rootStorage,
  onPathChange,
}: StorageStepProps) {
  const [granted, setGranted] = useState<boolean | undefined>(undefined);
  const theme = useTheme();
  const pickFolder = () => {
    FileManager.pickFolder().then(path => {
      if (path) {
        FileManager.readDir(path).then(res => {
          if (res.length > 0) {
            showToast('Please select an empty folder');
          } else {
            onPathChange(path);
          }
        });
      }
    });
  };
  const grantPermissions = () => {
    PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ]).then(value => {
      if (
        value['android.permission.READ_EXTERNAL_STORAGE'] === 'granted' &&
        value['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'
      ) {
        setGranted(true);
      } else {
        setGranted(false);
      }
    });
  };
  useEffect(() => {
    Promise.all([
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ),
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ),
    ])
      .then(([readGranted, writeGRanted]) => {
        if (readGranted && writeGRanted) {
          setGranted(true);
        } else {
          setGranted(false);
        }
      })
      .catch(() => {
        setGranted(false);
      });
  }, []);
  return (
    <View style={{ paddingHorizontal: 16 }}>
      <View style={styles.section}>
        <View>
          <Text style={[styles.title, { color: theme.onSurface }]}>
            App permissions
          </Text>
          <Text style={[{ color: theme.onSurfaceVariant }]}>
            Read and write external storage.
          </Text>
        </View>
        <Button
          mode="outlined"
          compact
          style={styles.grantButton}
          loading={granted === undefined}
          onPress={() => {
            if (granted === false) {
              grantPermissions();
            }
          }}
        >
          {granted === true ? (
            <MaterialCommunityIcons name="check" size={24} />
          ) : (
            <Text style={{ color: theme.primary, fontWeight: '600' }}>
              {granted === undefined ? 'Checking' : 'Allow'}
            </Text>
          )}
        </Button>
      </View>
      <View style={styles.section}>
        <View>
          <Text style={[styles.title, { color: theme.onSurface }]}>
            Select an empty folder.
          </Text>
          {rootStorage ? (
            <Text
              style={{
                color: theme.onSurfaceVariant,
                fontSize: 12,
                fontWeight: '500',
              }}
            >
              Selected folder: {rootStorage}
            </Text>
          ) : null}
        </View>
      </View>

      <Button
        labelStyle={{
          flex: 1,
        }}
        title="Select a folder"
        mode="contained"
        onPress={pickFolder}
        disabled={!granted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  grantButton: {
    alignSelf: 'center',
    paddingHorizontal: 8,
  },
});
