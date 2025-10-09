import EpubBuilder from '@cd-z/react-native-epub-creator';
import { useSettingsContext } from '@components/Context/SettingsContext';
import { ChapterInfo, NovelInfo } from '@database/types';
import { useBoolean } from '@hooks/index';
import NativeFile from '@specs/NativeFile';
import { ThemeColors } from '@theme/types';
import { MaterialDesignIconName } from '@type/icon';
import { showToast } from '@utils/showToast';
import { NOVEL_STORAGE } from '@utils/Storages';
import React, { useMemo } from 'react';
import { StatusBar, StyleProp, ViewStyle } from 'react-native';
import { Portal } from 'react-native-paper';

import ChooseEpubLocationModal from './ChooseEpubLocationModal';

interface EpubIconButtonProps {
  theme: ThemeColors;
  novel?: NovelInfo;
  chapters: ChapterInfo[];
  anchor: (props: {
    icon: MaterialDesignIconName;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
    size?: number;
  }) => React.JSX.Element;
}

const EpubIconButton: React.FC<EpubIconButtonProps> = ({
  theme,
  novel,
  chapters,
  anchor: Anchor,
}) => {
  const {
    value: isVisible,
    setTrue: showModal,
    setFalse: hideModal,
  } = useBoolean(false);
  const readerSettings = useSettingsContext();
  const {
    epubUseAppTheme,
    epubUseCustomCSS,
    epubUseCustomJS,
    codeSnippetsCSS,
    codeSnippetsJS,
  } = readerSettings;

  const epubCSS = useMemo(
    () =>
      !novel || !epubUseCustomCSS
        ? ''
        : codeSnippetsCSS
            .filter(snippet => snippet.active)
            .map(snippet => snippet.code)
            .join('\n'),
    [novel, epubUseCustomCSS, codeSnippetsCSS],
  );

  const epubStyle = useMemo(
    () =>
      !novel
        ? ''
        : `${
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
                background-color: "${readerSettings.backgroundColor}";
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
      ${epubUseCustomCSS && epubCSS ? epubCSS : ''}`,
    [
      novel,
      epubUseAppTheme,
      readerSettings.padding,
      readerSettings.textSize,
      readerSettings.textColor,
      readerSettings.textAlign,
      readerSettings.lineHeight,
      readerSettings.fontFamily,
      readerSettings.backgroundColor,
      epubCSS,
      theme.primary,
      epubUseCustomCSS,
    ],
  );

  const epubJS = useMemo(
    () =>
      !novel || !epubUseCustomJS
        ? ''
        : codeSnippetsJS
            .filter(snippet => snippet.active)
            .map(
              snippet => `
    try {
       ${snippet.code}
    } catch (error) {
      console.error(\`Error executing ${snippet.name}:\`, error);
    }
    `,
            )
            .join('\n'),
    [novel, epubUseCustomJS, codeSnippetsJS],
  );

  const createEpub = async (uri: string) => {
    if (!novel) {
      return;
    }
    const epub = new EpubBuilder(
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

    try {
      await epub.prepare();
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        const filePath = `${NOVEL_STORAGE}/${novel.pluginId}/${novel.id}/${chapter.id}/index.html`;
        if (NativeFile.exists(filePath)) {
          const downloaded = NativeFile.readFile(filePath);

          await epub.addChapter({
            title:
              chapter.name?.trim() ?? 'Chapter ' + (chapter.chapterNumber || i),
            fileName: 'Chapter' + i,
            htmlBody: `<chapter data-novel-id='${novel.pluginId}' data-chapter-id='${chapter.id}'>${downloaded}</chapter>`,
          });
        }
      }
      const epubFilePath = await epub.save();
      showToast('Epub file saved at: ' + epubFilePath);
    } catch (error) {
      showToast('Cannot create because: ' + error);
      await epub.discardChanges();
    }
  };
  return (
    <>
      <Anchor icon="book-arrow-down-outline" onPress={showModal} />
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
