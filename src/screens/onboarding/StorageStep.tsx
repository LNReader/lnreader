import React from 'react';
import { useTheme } from '@hooks/persisted';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@components';
import { StorageAccessFramework } from 'expo-file-system';
import FileManager from '@native/FileManager';
import { showToast } from '@utils/showToast';

interface StorageStepProps {
  rootStorage: string;
  onPathChange: (path: string) => void;
}

export default function StorageStep({
  rootStorage,
  onPathChange,
}: StorageStepProps) {
  const theme = useTheme();
  const pickFolder = () => {
    StorageAccessFramework.requestDirectoryPermissionsAsync().then(res => {
      if (res.granted) {
        FileManager.resolveExternalContentUri(res.directoryUri).then(path => {
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
      }
    });
  };
  return (
    <View style={{ paddingHorizontal: 16 }}>
      <Text style={[styles.text, { color: theme.onSurfaceVariant }]}>
        Select an empty folder.
      </Text>
      {rootStorage ? (
        <Text style={[styles.text, { color: theme.onSurfaceVariant }]}>
          Selected folder: {rootStorage}
        </Text>
      ) : null}

      <Button
        labelStyle={{
          flex: 1,
        }}
        title="Select a folder"
        mode="contained"
        onPress={pickFolder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    marginBottom: 16,
    fontSize: 12,
    fontWeight: '500',
  },
});
