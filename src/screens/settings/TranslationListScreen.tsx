import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {
  Text,
  Appbar,
  ActivityIndicator,
  Divider,
  FAB,
  IconButton,
  Portal,
  Checkbox,
  SegmentedButtons,
} from 'react-native-paper';
import { useTheme } from '@hooks/persisted';
import {
  getAllTranslationsByNovel,
  deleteTranslation,
} from '@database/queries/TranslationQueries';
import { NovelGroupedTranslations, TranslationInfo } from '@database/types';
import { getString } from '@strings/translations';
import { showToast } from '@utils/showToast';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FileManager from '@native/FileManager';

type TranslationListScreenProps = {
  navigation: any;
};

type ExportFormat = 'txt' | 'html' | 'epub';

const TranslationListScreen = ({ navigation }: TranslationListScreenProps) => {
  const theme = useTheme();
  const [translations, setTranslations] = useState<NovelGroupedTranslations[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [expandedNovelIds, setExpandedNovelIds] = useState<number[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Record<number, boolean>>(
    {},
  );
  const [selectedNovels, setSelectedNovels] = useState<Record<number, boolean>>(
    {},
  );
  const [fabOpen, setFabOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('txt');
  const [showFormatOptions, setShowFormatOptions] = useState(false);
  const [exportMode, setExportMode] = useState<'single' | 'combined'>('single');

  // Safe version of getString that handles missing translations
  const safeGetString = (key: string, options?: any) => {
    try {
      return getString(key as any, options);
    } catch (error) {
      return key.split('.').pop() || 'ERROR';
    }
  };

  const loadTranslations = useCallback(async () => {
    setLoading(true);
    try {
      const allTranslations = await getAllTranslationsByNovel();
      setTranslations(allTranslations);

      // Don't expand all novels by default
      // Remove: setExpandedNovelIds(allTranslations.map(novel => novel.novelId));
    } catch (error) {
      showToast(
        `Error loading translations: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTranslations();
  }, [loadTranslations]);

  const toggleNovelExpanded = (novelId: number) => {
    setExpandedNovelIds(prev => {
      if (prev.includes(novelId)) {
        return prev.filter(id => id !== novelId);
      } else {
        return [...prev, novelId];
      }
    });
  };

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode(prev => !prev);
    if (selectionMode) {
      // Clear selections when exiting selection mode
      setSelectedItems({});
      setSelectedNovels({});
    }
  }, [selectionMode]);

  const toggleItemSelection = useCallback((id: number) => {
    setSelectedItems(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const toggleNovelSelection = useCallback(
    (novelId: number, chapters: TranslationInfo[]) => {
      // Toggle the novel selection
      const newNovelSelected = !selectedNovels[novelId];
      setSelectedNovels(prev => ({
        ...prev,
        [novelId]: newNovelSelected,
      }));

      // Update all chapters in this novel to match the novel's selection state
      const newSelectedItems = { ...selectedItems };
      chapters.forEach(chapter => {
        if (chapter.id) {
          newSelectedItems[chapter.id] = newNovelSelected;
        }
        if (chapter.chapterId && chapter.chapterId !== chapter.id) {
          newSelectedItems[chapter.chapterId] = newNovelSelected;
        }
      });
      setSelectedItems(newSelectedItems);
    },
    [selectedNovels, selectedItems],
  );

  const getSelectedChapters = useCallback((): TranslationInfo[] => {
    const selected: TranslationInfo[] = [];

    // First, add all chapters from selected novels
    translations.forEach(novel => {
      if (selectedNovels[novel.novelId]) {
        selected.push(...novel.chapters);
      } else {
        // Add individually selected chapters
        novel.chapters.forEach(chapter => {
          if (selectedItems[chapter.id] || selectedItems[chapter.chapterId]) {
            selected.push(chapter);
          }
        });
      }
    });

    // Remove duplicates (by id)
    return Array.from(new Map(selected.map(item => [item.id, item])).values());
  }, [translations, selectedNovels, selectedItems]);

  const handleDeleteTranslation = useCallback(
    async (chapterId: number) => {
      try {
        await deleteTranslation(chapterId);
        loadTranslations(); // Reload the list
        showToast('Translation deleted');
      } catch (error) {
        showToast(
          `Error deleting translation: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    },
    [loadTranslations],
  );

  const confirmDeleteTranslation = useCallback(
    (chapterId: number) => {
      Alert.alert(
        safeGetString('common.delete'),
        safeGetString('translation.confirmDelete'),
        [
          {
            text: safeGetString('common.cancel'),
            style: 'cancel',
          },
          {
            text: safeGetString('common.delete'),
            style: 'destructive',
            onPress: () => handleDeleteTranslation(chapterId),
          },
        ],
      );
    },
    [handleDeleteTranslation, safeGetString],
  );

  const confirmDeleteSelected = useCallback(() => {
    const selectedChapters = getSelectedChapters();
    if (selectedChapters.length === 0) {
      showToast('No translations selected');
      return;
    }

    Alert.alert(
      safeGetString('common.delete'),
      `Are you sure you want to delete ${selectedChapters.length} translations?`,
      [
        {
          text: safeGetString('common.cancel'),
          style: 'cancel',
        },
        {
          text: safeGetString('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              let deletedCount = 0;
              for (const chapter of selectedChapters) {
                await deleteTranslation(chapter.chapterId);
                deletedCount++;
              }
              showToast(`Deleted ${deletedCount} translations`);
              setSelectionMode(false);
              setSelectedItems({});
              setSelectedNovels({});
              loadTranslations();
            } catch (error) {
              showToast(
                `Error: ${
                  error instanceof Error ? error.message : 'Unknown error'
                }`,
              );
            }
          },
        },
      ],
    );
  }, [getSelectedChapters, loadTranslations, safeGetString]);

  const exportTranslation = useCallback(
    async (translation: TranslationInfo) => {
      if (!translation || !translation.content) {
        showToast(safeGetString('translation.noTranslationToExport'));
        return;
      }

      try {
        // Get novel and chapter info for filename
        const novelName = translation.novelTitle || 'Unknown Novel';
        const chapterName = translation.chapterTitle || 'Unknown Chapter';

        // Sanitize names for file creation
        const sanitizedNovelName = novelName.replace(/[/\\?%*:|"<>]/g, '-');
        const sanitizedChapterName = chapterName.replace(/[/\\?%*:|"<>]/g, '-');

        // Generate timestamp for unique filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        // Create main LNReader directory in Downloads
        const baseDir = '/storage/emulated/0/Download/LNReader';
        const novelDir = `${baseDir}/${sanitizedNovelName}`;

        // Create directories
        await FileManager.mkdir(baseDir);
        await FileManager.mkdir(novelDir);

        let exportFile = '';
        let content = '';

        if (exportFormat === 'txt') {
          exportFile = `${novelDir}/${sanitizedChapterName}-${timestamp}.txt`;
          // Convert HTML content to plain text for export
          content = translation.content
            .replace(/<br\s*\/?>/gi, '\n') // Convert <br> tags to newlines
            .replace(/&nbsp;&nbsp;/g, '  ') // Convert non-breaking spaces back to regular spaces
            .replace(/&nbsp;/g, ' ')
            .replace(/<[^>]*>/g, ''); // Remove any other HTML tags
        } else if (exportFormat === 'html') {
          exportFile = `${novelDir}/${sanitizedChapterName}-${timestamp}.html`;
          // Create a simple HTML document
          content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${novelName} - ${chapterName}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
    h1 { text-align: center; }
    .content { max-width: 800px; margin: 0 auto; }
  </style>
</head>
<body>
  <h1>${novelName} - ${chapterName}</h1>
  <div class="content">
    ${translation.content}
  </div>
</body>
</html>`;
        } else {
          // epub - simplified version
          exportFile = `${novelDir}/${sanitizedChapterName}-${timestamp}.epub`;
          // For a real EPUB implementation, more work would be needed
          // This is just a placeholder HTML with EPUB extension
          content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${novelName} - ${chapterName}</title>
  <style>
    body { font-family: serif; line-height: 1.6; margin: 20px; }
    h1 { text-align: center; }
    .content { max-width: 800px; margin: 0 auto; }
  </style>
</head>
<body>
  <h1>${novelName} - ${chapterName}</h1>
  <div class="content">
    ${translation.content}
  </div>
</body>
</html>`;
          showToast(
            'Note: This is a simplified EPUB export (HTML with EPUB extension)',
          );
        }

        // Write to file
        await FileManager.writeFile(exportFile, content);
        showToast(`Exported to ${novelDir}/${sanitizedChapterName}`);
        return exportFile;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        showToast(
          safeGetString('translation.exportError', { error: errorMessage }),
        );
        return null;
      }
    },
    [safeGetString, exportFormat],
  );

  const exportSelected = useCallback(async () => {
    const selectedChapters = getSelectedChapters();
    if (selectedChapters.length === 0) {
      showToast('No translations selected for export');
      return;
    }

    try {
      let successCount = 0;
      for (const chapter of selectedChapters) {
        const result = await exportTranslation(chapter);
        if (result) {
          successCount++;
        }
      }

      if (successCount > 0) {
        showToast(
          `Successfully exported ${successCount} of ${selectedChapters.length} translations to Download/LNReader`,
        );
        setSelectionMode(false);
        setSelectedItems({});
        setSelectedNovels({});
      } else {
        showToast('Failed to export any translations');
      }
    } catch (error) {
      showToast(
        `Export error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }, [getSelectedChapters, exportTranslation]);

  const getSelectedCount = useCallback(() => {
    // Count directly selected items
    const directlySelectedCount =
      Object.values(selectedItems).filter(Boolean).length;

    // Count items in selected novels that aren't directly selected
    let novelSelectionCount = 0;
    translations.forEach(novel => {
      if (selectedNovels[novel.novelId]) {
        novel.chapters.forEach(chapter => {
          if (!selectedItems[chapter.id] && !selectedItems[chapter.chapterId]) {
            novelSelectionCount++;
          }
        });
      }
    });

    return directlySelectedCount + novelSelectionCount;
  }, [selectedItems, selectedNovels, translations]);

  const renderChapterItem = ({ item }: { item: TranslationInfo }) => (
    <View
      style={[
        styles.chapterItem,
        { backgroundColor: theme.surface },
        (selectedItems[item.id] || selectedItems[item.chapterId]) &&
          styles.selectedItem,
      ]}
    >
      {selectionMode && (
        <View style={styles.checkbox}>
          <Checkbox
            status={
              selectedItems[item.id] || selectedItems[item.chapterId]
                ? 'checked'
                : 'unchecked'
            }
            onPress={() => toggleItemSelection(item.id)}
          />
        </View>
      )}
      <View style={styles.chapterDetails}>
        <Text style={[styles.chapterTitle, { color: theme.onSurface }]}>
          {item.chapterTitle}
        </Text>
        <Text style={[styles.previewText, { color: theme.onSurfaceVariant }]}>
          {item.previewText}
        </Text>
        <Text style={[styles.modelText, { color: theme.onSurfaceVariant }]}>
          Model: {item.model}
        </Text>
        <Text style={[styles.dateText, { color: theme.onSurfaceVariant }]}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
      {!selectionMode && (
        <View style={styles.actionButtons}>
          <IconButton
            icon="export-variant"
            size={20}
            onPress={() => exportTranslation(item)}
          />
          <IconButton
            icon="delete"
            size={20}
            iconColor={theme.error}
            onPress={() => confirmDeleteTranslation(item.chapterId)}
          />
        </View>
      )}
    </View>
  );

  const renderNovelItem = ({ item }: { item: NovelGroupedTranslations }) => {
    const isExpanded = expandedNovelIds.includes(item.novelId);
    const isNovelSelected = selectedNovels[item.novelId] === true;

    return (
      <View style={[styles.novelContainer, { backgroundColor: theme.surface }]}>
        <View style={styles.novelHeader}>
          {selectionMode && (
            <View style={styles.novelCheckbox}>
              <Checkbox
                status={isNovelSelected ? 'checked' : 'unchecked'}
                onPress={() =>
                  toggleNovelSelection(item.novelId, item.chapters)
                }
              />
            </View>
          )}
          <TouchableOpacity
            style={[styles.novelInfo, { flex: 1 }]}
            onPress={() => toggleNovelExpanded(item.novelId)}
          >
            {item.novelCover ? (
              <Image
                source={{ uri: item.novelCover }}
                style={styles.coverImage}
              />
            ) : (
              <View
                style={[
                  styles.coverPlaceholder,
                  { backgroundColor: theme.surfaceVariant },
                ]}
              >
                <Icon name="book" size={24} color={theme.onSurfaceVariant} />
              </View>
            )}
            <View style={styles.novelTextContainer}>
              <Text style={[styles.novelTitle, { color: theme.onSurface }]}>
                {item.novelTitle}
              </Text>
              <Text
                style={[styles.chapterCount, { color: theme.onSurfaceVariant }]}
              >
                {item.chapters.length} {safeGetString('common.chapters')}
              </Text>
            </View>
          </TouchableOpacity>
          <Icon
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={theme.primary}
          />
        </View>

        {isExpanded && (
          <View>
            <FlatList
              data={item.chapters}
              renderItem={renderChapterItem}
              keyExtractor={chapter => `chapter-${chapter.id}`}
              ItemSeparatorComponent={() => <Divider />}
              scrollEnabled={false}
            />
          </View>
        )}
      </View>
    );
  };

  const renderFormatOptions = () => (
    <View style={styles.formatOptionsContainer}>
      <Text style={[styles.formatTitle, { color: theme.onSurface }]}>
        Export Options
      </Text>

      <Text style={[styles.optionLabel, { color: theme.onSurface }]}>
        Format:
      </Text>
      <SegmentedButtons
        value={exportFormat}
        onValueChange={value => setExportFormat(value as ExportFormat)}
        buttons={[
          { value: 'txt', label: 'TXT' },
          { value: 'html', label: 'HTML' },
          { value: 'epub', label: 'EPUB' },
        ]}
        style={styles.segmentedButtons}
      />

      <Text
        style={[styles.optionLabel, { color: theme.onSurface, marginTop: 12 }]}
      >
        Export Type:
      </Text>
      <SegmentedButtons
        value={exportMode}
        onValueChange={value => setExportMode(value as 'single' | 'combined')}
        buttons={[
          { value: 'single', label: 'Separate Files' },
          { value: 'combined', label: 'Single File' },
        ]}
        style={styles.segmentedButtons}
      />

      <View style={styles.formatButtonsRow}>
        <TouchableOpacity
          style={[styles.formatButton, { backgroundColor: theme.error }]}
          onPress={() => setShowFormatOptions(false)}
        >
          <Text style={{ color: theme.onPrimary }}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.formatButton, { backgroundColor: theme.primary }]}
          onPress={() => {
            setShowFormatOptions(false);
            if (exportMode === 'combined') {
              handleExportCombined();
            } else {
              exportSelected();
            }
          }}
        >
          <Text style={{ color: theme.onPrimary }}>Export</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Export multiple chapters into a single file with index
  const exportCombinedFile = useCallback(
    async (novel: NovelGroupedTranslations, chapters: TranslationInfo[]) => {
      try {
        if (!novel || !chapters || chapters.length === 0) {
          showToast('No chapters to export');
          return false;
        }

        // Get novel info and sanitize for filenames
        const novelName = novel.novelTitle || 'Unknown Novel';
        const sanitizedNovelName = novelName.replace(/[/\\?%*:|"<>]/g, '-');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        // Set up directory structure
        const baseDir = '/storage/emulated/0/Download/LNReader';
        const novelDir = `${baseDir}/${sanitizedNovelName}`;

        // Create directories
        await FileManager.mkdir(baseDir);
        await FileManager.mkdir(novelDir);

        // Sort chapters by their title if possible (assuming chapter numbers in titles)
        const sortedChapters = [...chapters].sort((a, b) => {
          // Try to extract numbers from chapter titles
          const aMatch = a.chapterTitle?.match(/\d+/);
          const bMatch = b.chapterTitle?.match(/\d+/);

          if (aMatch && bMatch) {
            return parseInt(aMatch[0]) - parseInt(bMatch[0]);
          }

          return a.chapterTitle?.localeCompare(b.chapterTitle || '') || 0;
        });

        if (exportFormat === 'txt') {
          // For TXT format, concatenate all chapters with headers
          let combinedContent = `${novelName}\n\n`;

          // Create a simple table of contents
          combinedContent += 'TABLE OF CONTENTS\n\n';
          sortedChapters.forEach((chapter, index) => {
            combinedContent += `${index + 1}. ${chapter.chapterTitle}\n`;
          });
          combinedContent += '\n\n';

          // Add each chapter with a divider
          sortedChapters.forEach((chapter, index) => {
            // Process the content to strip HTML
            const processedContent = chapter.content
              .replace(/<br\s*\/?>/gi, '\n') // Convert <br> tags to newlines
              .replace(/&nbsp;&nbsp;/g, '  ') // Convert non-breaking spaces back to regular spaces
              .replace(/&nbsp;/g, ' ')
              .replace(/<[^>]*>/g, ''); // Remove any other HTML tags

            combinedContent += `CHAPTER ${index + 1}: ${
              chapter.chapterTitle
            }\n\n`;
            combinedContent += `${processedContent}\n\n`;
            combinedContent += '--------------------\n\n';
          });

          // Create a unique filename with timestamp
          const filename = `${sanitizedNovelName}-combined-${timestamp}.txt`;
          const fullPath = `${novelDir}/${filename}`;

          // Write to file
          await FileManager.writeFile(fullPath, combinedContent);
          showToast(`Combined export successful: ${filename}`);
          return true;
        } else if (exportFormat === 'html' || exportFormat === 'epub') {
          // For HTML and EPUB, create a styled document with chapters
          let tableOfContents = '';
          let chapterContents = '';

          // Process each chapter and build the content
          sortedChapters.forEach((chapter, index) => {
            const chapterNum = index + 1;
            const anchorId = `chapter-${chapterNum}`;

            // Add entry to table of contents
            tableOfContents += `<li><a href="#${anchorId}">${chapter.chapterTitle}</a></li>\n`;

            // Add chapter content with proper styling
            chapterContents += `
<div id="${anchorId}" class="chapter">
  <h2>Chapter ${chapterNum}: ${chapter.chapterTitle}</h2>
  <div class="chapter-content">
    ${chapter.content}
  </div>
</div>`;
          });

          // Create full HTML document
          let htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>${novelName}</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Base styling for exported content */
    :root {
      --text-color: #333;
      --background-color: #fff;
      --link-color: #0066cc;
      --heading-color: #444;
      --border-color: #eee;
    }
    
    @media (prefers-color-scheme: dark) {
      :root {
        --text-color: #e0e0e0;
        --background-color: #121212;
        --link-color: #64b5f6;
        --heading-color: #bbdefb;
        --border-color: #333;
      }
    }

    body {
      font-family: 'Noto Serif', serif;
      line-height: 1.6;
      margin: 0 auto;
      padding: 2em;
      max-width: 40em;
      color: var(--text-color);
      background-color: var(--background-color);
    }
    
    h1, h2, h3 {
      text-align: center;
      margin-top: 1em;
      margin-bottom: 1em;
      color: var(--heading-color);
    }
    
    h1 {
      font-size: 2em;
      margin-top: 2em;
    }
    
    h2 {
      font-size: 1.8em;
    }
    
    .toc {
      margin: 2em 0;
      padding: 1em;
      background-color: rgba(0,0,0,0.05);
      border-radius: 4px;
    }
    
    .toc h3 {
      margin-top: 0;
    }
    
    .toc ul {
      padding-left: 2em;
    }
    
    .toc a {
      color: var(--link-color);
      text-decoration: none;
    }
    
    .toc a:hover {
      text-decoration: underline;
    }
    
    .chapter {
      margin-top: 3em;
      border-top: 1px solid var(--border-color);
      padding-top: 2em;
    }
    
    .chapter-content {
      line-height: 1.8;
    }
  </style>
</head>
<body>
  <h1>${novelName}</h1>
  
  <div class="toc">
    <h3>Table of Contents</h3>
    <ul>
      ${tableOfContents}
    </ul>
  </div>
  
  ${chapterContents}
</body>
</html>`;

          // Determine filename based on format
          let filename, fullPath;

          if (exportFormat === 'html') {
            filename = `${sanitizedNovelName}-combined-${timestamp}.html`;
          } else {
            // EPUB
            filename = `${sanitizedNovelName}-combined-${timestamp}.epub`;
            showToast(
              'Note: This is a simplified EPUB export (HTML with EPUB extension)',
            );
          }

          fullPath = `${novelDir}/${filename}`;

          // Write the file
          await FileManager.writeFile(fullPath, htmlContent);
          showToast(`Combined export successful: ${filename}`);
          return true;
        }

        return false;
      } catch (error) {
        showToast(
          `Export error: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
        return false;
      }
    },
    [exportFormat],
  );

  // Add handler for combined export
  const handleExportCombined = useCallback(async () => {
    const selectedChapters = getSelectedChapters();
    if (selectedChapters.length === 0) {
      showToast('No translations selected for export');
      return;
    }

    try {
      // Group chapters by novel for organized export
      const novelMap = new Map<
        number,
        { novel: NovelGroupedTranslations; chapters: TranslationInfo[] }
      >();

      // Group selected chapters by novelId
      selectedChapters.forEach(chapter => {
        const novelId = chapter.novelId || -1;

        if (!novelMap.has(novelId)) {
          // Find the novel in the translations list
          const novel = translations.find(n => n.novelId === novelId);
          if (novel) {
            novelMap.set(novelId, { novel, chapters: [] });
          } else {
            // Create a placeholder novel if not found
            novelMap.set(novelId, {
              novel: {
                novelId,
                novelTitle: chapter.novelTitle || 'Unknown Novel',
                novelCover: chapter.novelCover,
                chapters: [],
              },
              chapters: [],
            });
          }
        }

        novelMap.get(novelId)?.chapters.push(chapter);
      });

      // Export each novel as a combined file
      let successCount = 0;

      for (const [_, { novel, chapters }] of novelMap.entries()) {
        if (chapters.length > 0) {
          const success = await exportCombinedFile(novel, chapters);
          if (success) {
            successCount++;
          }
        }
      }

      if (successCount > 0) {
        showToast(
          `Exported ${successCount} combined files to Download/LNReader`,
        );
        setSelectionMode(false);
        setSelectedItems({});
        setSelectedNovels({});
      } else {
        showToast('Failed to export any combined files');
      }
    } catch (error) {
      showToast(
        `Export error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }, [getSelectedChapters, translations, exportCombinedFile]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Appbar.Header style={{ backgroundColor: theme.surface }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          title={safeGetString('translation.manageTranslations')}
          subtitle={
            selectionMode ? `${getSelectedCount()} selected` : undefined
          }
        />
        <Appbar.Action
          icon={selectionMode ? 'check' : 'checkbox-marked-circle-outline'}
          onPress={toggleSelectionMode}
        />
      </Appbar.Header>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.onSurface }]}>
            Loading...
          </Text>
        </View>
      ) : translations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="translate" size={48} color={theme.onSurfaceVariant} />
          <Text style={[styles.emptyText, { color: theme.onSurface }]}>
            {safeGetString('translation.noTranslationsFound')}
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={translations}
            renderItem={renderNovelItem}
            keyExtractor={novel => `novel-${novel.novelId}`}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />

          {showFormatOptions && (
            <View style={styles.formatOptionsOverlay}>
              {renderFormatOptions()}
            </View>
          )}

          <Portal>
            <FAB.Group
              visible={selectionMode && getSelectedCount() > 0}
              open={fabOpen}
              icon={fabOpen ? 'close' : 'dots-vertical'}
              actions={[
                {
                  icon: 'delete',
                  label: 'Delete Selected',
                  onPress: confirmDeleteSelected,
                },
                {
                  icon: 'export',
                  label: 'Export Selected',
                  onPress: () => setShowFormatOptions(true),
                },
              ]}
              onStateChange={({ open }) => setFabOpen(open)}
              onPress={() => {
                if (fabOpen) {
                  setFabOpen(false);
                }
              }}
            />
          </Portal>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  listContent: {
    padding: 8,
    paddingBottom: 80, // Extra space for FAB
  },
  separator: {
    height: 8,
  },
  novelContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  novelHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  novelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coverImage: {
    width: 50,
    height: 70,
    borderRadius: 4,
  },
  coverPlaceholder: {
    width: 50,
    height: 70,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  novelTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  novelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chapterCount: {
    fontSize: 14,
    marginTop: 4,
  },
  chapterItem: {
    padding: 16,
    flexDirection: 'row',
  },
  chapterDetails: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  previewText: {
    fontSize: 13,
    marginTop: 4,
  },
  modelText: {
    fontSize: 12,
    marginTop: 4,
  },
  dateText: {
    fontSize: 11,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedItem: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  checkbox: {
    marginRight: 8,
  },
  novelCheckbox: {
    marginRight: 8,
  },
  formatOptionsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  formatOptionsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: '80%',
    maxWidth: 400,
  },
  formatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  formatButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formatButton: {
    padding: 12,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabel: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default TranslationListScreen;
