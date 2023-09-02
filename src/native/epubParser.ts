import { getNovel } from '@database/queries/NovelQueries';
import { insertNovelInLibrary } from '@database/queries/NovelQueriesV2';
import { NativeModules } from 'react-native';

const { EpubParser } = NativeModules;
const epubSourceId = 0;

interface EpubParserInterface {
  openDirectory(): Promise<string>;
}

export async function openDirectory() {
  const ParserInterface = EpubParser as EpubParserInterface;
  const epubPath = await ParserInterface.openDirectory();

  let dbNovel = await getNovel(epubSourceId, epubPath);
  if (dbNovel === undefined || dbNovel.followed === 0) {
    // Insert novel if it doesn't exist in the database
    await insertNovelInLibrary(epubSourceId, epubPath, false, 1);
  }
}
