import { SourceNovel } from '@plugins/types';
import { NativeModules } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as RNFS from 'react-native-fs';

const { EpubParser } = NativeModules;

export const parseEpub = async () => {
  const epubFile = await DocumentPicker.getDocumentAsync({
    type: 'application/epub+zip',
    copyToCacheDirectory: true,
  });
  const tempDirPath = RNFS.ExternalCachesDirectoryPath + '/epub';
  await RNFS.mkdir(tempDirPath);
  try {
    if (epubFile.type === 'cancel') {
      throw new Error('Cannel');
    }
    const newPath = RNFS.ExternalCachesDirectoryPath + '/novel.epub';
    await RNFS.moveFile(epubFile.uri, newPath);
    console.log(newPath);
    const novel: SourceNovel = await EpubParser.parse(newPath, tempDirPath);
    console.log(
      'novel name: ',
      novel.name,
      ' | author: ',
      novel.author,
      ' | uri: ',
      novel.url,
    );
    novel.chapters?.forEach(chapter => {
      console.log('chapter name: ', chapter.name, ' | uri: ', chapter.url);
    });
  } catch (e) {
    console.log(e);
  }
};
