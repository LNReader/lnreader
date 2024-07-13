import React, { useMemo } from 'react';
import { IconButton, Portal } from 'react-native-paper';
import ChooseEpubLocationModal from './ChooseEpubLocationModal';
import { StatusBar } from 'react-native';
import { ThemeColors } from '@theme/types';

import EpubBuilder from '@cd-z/react-native-epub-creator';
import { ChapterInfo, NovelInfo } from '@database/types';

import { useChapterReaderSettings } from '@hooks/persisted';
import { useBoolean } from '@hooks/index';
import { showToast } from '@utils/showToast';
import { NOVEL_STORAGE } from '@utils/Storages';
import FileManager from '@native/FileManager';

interface EpubIconButtonProps {
  theme: ThemeColors;
  novel: NovelInfo;
  chapters: ChapterInfo[];
}

const EpubIconButton: React.FC<EpubIconButtonProps> = ({
  theme,
  novel,
  chapters,
}) => {
  const {
    value: isVisible,
    setTrue: showModal,
    setFalse: hideModal,
  } = useBoolean(false);
  const readerSettings = useChapterReaderSettings();
  const {
    epubUseAppTheme = false,
    epubUseCustomCSS = false,
    epubUseCustomJS = false,
  } = useChapterReaderSettings();

  const epubStyle = useMemo(
    () =>
      `${
        epubUseAppTheme
          ? `
              html {
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
            }`
          : ''
      }
      ${
        epubUseCustomCSS
          ? readerSettings.customCSS
              .replace(
                RegExp(`\#sourceId-${novel.pluginId}\\s*\\{`, 'g'),
                'body {',
              )
              .replace(
                RegExp(`\#sourceId-${novel.pluginId}[^\.\#A-Z]*`, 'gi'),
                '',
              )
          : ''
      }`,
    [novel, epubUseAppTheme, readerSettings, epubUseCustomCSS],
  );

  const epubJS = useMemo(
    () =>
      `
        let novelName = "${novel.name}";
        let chapterName = "";
        let sourceId =${novel.pluginId};
        let chapterId ="";
        let novelId =${novel.id};
        let html = document.querySelector("chapter").innerHTML;
          
        ${readerSettings.customJS}
        `,
    [novel, readerSettings],
  );

  const createEpub = async (uri: string) => {
    var epub = new EpubBuilder(
      {
        title: novel.name,
        fileName: novel.name.replace(/\s/g, ''),
        language: 'en',
        cover: novel.cover,
        description: novel.summary,
        author: novel.author,
        bookId: novel.pluginId.toString(),
        stylesheet: epubStyle || undefined,
        js: epubUseCustomJS ? epubJS : undefined,
      },
      uri,
    );
    console.log({
      title: novel.name,
      fileName: novel.name.replace(/\s/g, ''),
      language: 'en',
      cover: novel.cover,
      description: novel.summary,
      author: novel.author,
      bookId: novel.pluginId.toString(),
      stylesheet: epubStyle || undefined,
      js: epubUseCustomJS ? epubJS : undefined,
    });
    try {
      await epub.prepare();
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        const filePath = `${NOVEL_STORAGE}/${novel.pluginId}/${novel.id}/${chapter.id}/index.html`;
        if (await FileManager.exists(filePath)) {
          const downloaded = FileManager.readFile(filePath);
          console.log({
            title:
              chapter.name?.trim() ?? 'Chapter ' + (chapter.chapterNumber || i),
            fileName: 'Chapter' + i,
            htmlBody: `<chapter data-novel-id='${novel.pluginId}' data-chapter-id='${chapter.id}'>${downloaded}</chapter>`,
          });

          await epub.addChapter({
            title:
              chapter.name?.trim() ?? 'Chapter ' + (chapter.chapterNumber || i),
            fileName: 'Chapter' + i,
            htmlBody: `<chapter data-novel-id='${novel.pluginId}' data-chapter-id='${chapter.id}'>${downloaded}</chapter>`,
          });
        }
      }
      var epubFilePath = await epub.save();
      showToast('Epub file saved at: ' + epubFilePath);
    } catch (error) {
      console.error(error);
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
        onPress={showModal}
      />
      <Portal>
        <ChooseEpubLocationModal
          isVisible={isVisible}
          hideModal={hideModal}
          onSubmit={createEpub}
        />
      </Portal>
    </>
  );
};
export default EpubIconButton;
