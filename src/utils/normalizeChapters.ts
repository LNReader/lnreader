import { ChapterInfo, DownloadedChapter } from '@database/types';
import dayjs from 'dayjs';
import { parseChapterNumber } from './parseChapterNumber';

function normaliseChapters<T extends ChapterInfo[] | null>(
  raw: T,
  novelName: string,
): T;
function normaliseChapters<T extends DownloadedChapter[] | null>(
  raw: T,
  novelName?: string,
): T;
function normaliseChapters<
  T extends Array<ChapterInfo | DownloadedChapter> | null,
>(raw: T, novelName?: string): T;
function normaliseChapters<
  T extends Array<ChapterInfo | DownloadedChapter> | null,
>(
  raw: T,
  novelName: string = '',
): Array<ChapterInfo | DownloadedChapter> | null {
  if (!raw) return null;
  return raw.map(c => ({
    ...c,
    releaseTime: dayjs(c.releaseTime).isValid()
      ? dayjs(c.releaseTime).format('LL')
      : c.releaseTime,
    chapterNumber:
      // @ts-ignore
      c.chapterNumber ?? parseChapterNumber(novelName ?? c.novelName, c.name),
  }));
}

async function normaliseAsyncChapters<T extends ChapterInfo[] | null>(
  raw: Promise<T>,
  novelName: string,
): Promise<T>;
async function normaliseAsyncChapters<T extends DownloadedChapter[] | null>(
  raw: Promise<T>,
  novelName?: string,
): Promise<T>;
async function normaliseAsyncChapters<
  T extends Array<ChapterInfo | DownloadedChapter> | null,
>(raw: Promise<T>, novelName?: string): Promise<T>;
async function normaliseAsyncChapters<
  T extends Array<ChapterInfo | DownloadedChapter> | null,
>(
  raw: Promise<T>,
  novelName?: string,
): Promise<Array<ChapterInfo | DownloadedChapter> | null> {
  return raw.then(c => normaliseChapters(c, novelName));
}

function normaliseChapter<T extends ChapterInfo | null>(
  raw: T,
  novelName: string,
): T;
function normaliseChapter<T extends DownloadedChapter | null>(
  raw: T,
  novelName?: string,
): T;
function normaliseChapter<T extends ChapterInfo | DownloadedChapter | null>(
  raw: T,
  novelName?: string,
): T;
function normaliseChapter<T extends ChapterInfo | DownloadedChapter | null>(
  raw: T,
  novelName: string = '',
): ChapterInfo | DownloadedChapter | null {
  if (!raw) return raw;
  return {
    ...raw,
    releaseTime: dayjs(raw.releaseTime).isValid()
      ? dayjs(raw.releaseTime).format('LL')
      : raw.releaseTime,
    chapterNumber:
      raw.chapterNumber ??
      // @ts-ignore
      parseChapterNumber(novelName ?? raw.novelName, raw.name),
  };
}
async function normaliseAsyncChapter<T extends ChapterInfo | null>(
  raw: Promise<T>,
  novelName: string,
): Promise<T>;
async function normaliseAsyncChapter<T extends DownloadedChapter | null>(
  raw: Promise<T>,
  novelName?: string,
): Promise<T>;
async function normaliseAsyncChapter<
  T extends ChapterInfo | DownloadedChapter | null,
>(raw: Promise<T>, novelName?: string): Promise<T>;
async function normaliseAsyncChapter<
  T extends ChapterInfo | DownloadedChapter | null,
>(
  raw: Promise<T>,
  novelName?: string,
): Promise<ChapterInfo | DownloadedChapter | null> {
  const c = await raw;
  if (!c) return c;
  return normaliseChapter(c, novelName);
}

export {
  normaliseChapters,
  normaliseChapter,
  normaliseAsyncChapters,
  normaliseAsyncChapter,
};
