import * as React from 'react';
import useBoolean from '@hooks/useBoolean';
import { IconButton, Portal } from 'react-native-paper';
import ChooseEpubLocationModal from './Modal/ChooseEpubLocationModal';
import { StatusBar, StyleProp } from 'react-native';
import { IconProps } from 'react-native-paper/lib/typescript/src/components/MaterialCommunityIcon';
import { ThemeColors } from '@theme/types';

import EpubBuilder from '@cd-z/react-native-epub-creator';
import { ChapterItem, LibraryNovelInfo } from '@database/types';
import { showToast } from '@hooks/showToast';
import { getChapterFromDb } from '@database/queries/DownloadQueries';
import { useReaderSettings } from '@redux/hooks';

interface extendedNovelInfo extends LibraryNovelInfo {
  chapters: ChapterItem[];
}
interface EpubIconButtonProps {
  theme: ThemeColors;
  style: StyleProp<IconProps>;
  novel: extendedNovelInfo;
}

const EpubIconButton: React.FC<EpubIconButtonProps> = ({
  theme,
  style,
  novel,
}) => {
  const chooseEpubLocationModal = useBoolean(false);
  const readerSettings = useReaderSettings();
  const useAppTheme = useBoolean(false);

  const epubStyle = `html {
    scroll-behavior: smooth;
    overflow-x: hidden;
    padding-top: ${StatusBar.currentHeight};
    word-wrap: break-word;
  }
  body {
    padding-left: ${readerSettings.padding}%;
    padding-right: ${readerSettings.padding}%;
    padding-bottom: 40px;
    font-size: ${readerSettings.textSize}px;
    color: ${readerSettings.textColor};
    text-align: ${readerSettings.textAlign};
    line-height: ${readerSettings.lineHeight};
    font-family: "${readerSettings.fontFamily}";
    background-color: "${readerSettings.theme}";
  }
  hr {
    margin-top: 20px;
    margin-bottom: 20px;
  }
  a {
    color: ${theme.primary};
  }
  img {
    display: block;
    width: auto;
    height: auto;
    max-width: 100%;
  }
  
  ${readerSettings.customCSS}`;

  const createEpub = async (uri: string) => {
    var epub = new EpubBuilder(
      {
        title: novel.novelName,
        fileName: novel.novelName.replace(/\s/g, ''),
        language: 'en',
        cover: novel.novelCover,
        description: novel.novelSummary,
        author: novel.author,
        bookId: novel.novelId.toString(),
        stylesheet: useAppTheme.value ? epubStyle : undefined,
      },
      uri,
    );
    try {
      // save and create the .epub file
      await epub.prepare();
      for (let i = 0; i < novel.chapters.length; i++) {
        const chapter = novel.chapters[i];
        if (chapter.downloaded) {
          const downloaded = await getChapterFromDb(chapter.chapterId);

          await epub.addChapter({
            title: downloaded.chapterName?.trim() ?? 'Chapter ' + i,
            fileName: 'Chapter' + i,
            htmlBody: downloaded.chapterText,
          });
        }
      }
      var epubFilePath = await epub.save();
      showToast('Epub file saved at: ' + epubFilePath);
    } catch (error) {
      showToast('Cannot create because: ' + error);
      await epub.discardChanges();
    }
  };

  return (
    <>
      <IconButton
        icon="book-arrow-down-outline"
        iconColor={theme.onBackground}
        size={21}
        style={style}
        onPress={chooseEpubLocationModal.setTrue}
      />
      <Portal>
        <ChooseEpubLocationModal
          modalVisible={chooseEpubLocationModal.value}
          hideModal={chooseEpubLocationModal.setFalse}
          onSubmit={createEpub}
          useAppTheme={useAppTheme}
          showExtraSettings
        />
      </Portal>
    </>
  );
};
export default EpubIconButton;
