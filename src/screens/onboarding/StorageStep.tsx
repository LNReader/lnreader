import React from 'react';
import { useTheme } from '@hooks/persisted';
import { Text, View } from 'react-native';
import { Button } from '@components';
import { StorageAccessFramework } from 'expo-file-system';
import FileManager from '@native/FileManager';

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
            onPathChange(path);
          }
        });
      }
    });
  };
  return (
    <View style={{ paddingHorizontal: 16 }}>
      <Text style={{ color: theme.onSurfaceVariant }}>
        Recommend to create a new empty folder.
      </Text>
      {rootStorage ? (
        <Text style={{ color: theme.onSurfaceVariant }}>
          Selected folder: {rootStorage}
        </Text>
      ) : null}

      <Button
        labelStyle={{
          flex: 1,
        }}
        style={{
          marginTop: 16,
        }}
        title="Select a folder"
        mode="contained"
        onPress={pickFolder}
      />
    </View>
  );
}
