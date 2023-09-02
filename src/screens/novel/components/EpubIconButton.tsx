import React, { useMemo } from 'react';
import useBoolean from '@hooks/useBoolean';
import { IconButton, Portal } from 'react-native-paper';
import ChooseEpubLocationModal from './ChooseEpubLocationModal';
import { StatusBar, StyleProp } from 'react-native';
import { IconProps } from 'react-native-paper/lib/typescript/src/components/MaterialCommunityIcon';
import { ThemeColors } from '@theme/types';

import EpubBuilder from '@cd-z/react-native-epub-creator';
import { ChapterItem, LibraryNovelInfo } from '@database/types';
import { showToast } from '@hooks/showToast';
import { getChapterFromDb } from '@database/queries/DownloadQueries';
import { useReaderSettings } from '@redux/hooks';
import { useSettings } from '@hooks/reduxHooks';

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
  const {
    value: isVisible,
    setTrue: showModal,
    setFalse: hideModal,
  } = useBoolean(false);
  const readerSettings = useReaderSettings();
  const {
    epubUseAppTheme = false,
    epubUseCustomCSS = false,
    epubUseCustomJS = false,
  } = useSettings();

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
                RegExp(`\#sourceId-${novel.sourceId}\\s*\\{`, 'g'),
                'body {',
              )
              .replace(
                RegExp(`\#sourceId-${novel.sourceId}[^\.\#A-Z]*`, 'gi'),
                '',
              )
          : ''
      }`,
    [novel, epubUseAppTheme, readerSettings, epubUseCustomCSS],
  );

  const epubJS = useMemo(
    () =>
      `
        let novelName = "${novel.novelName}";
        let chapterName = "";
        let sourceId =${novel.sourceId};
        let chapterId ="";
        let novelId =${novel.novelId};
        let html = document.querySelector("chapter").innerHTML;
          
        ${readerSettings.customJS}
        `,
    [novel, readerSettings],
  );

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
        stylesheet: epubStyle || undefined,
        js: epubUseCustomJS ? epubJS : undefined,
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
            htmlBody: `<chapter data-novel-id='${chapter.novelId}' data-chapter-id='${chapter.chapterId}'>${downloaded.chapterText}</chapter>`,
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
