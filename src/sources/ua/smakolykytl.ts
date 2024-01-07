import { Status } from '../helpers/constants';
import dayjs from 'dayjs';
import { SourceChapter, SourceNovel, SourceNovelItem } from '../types';

const sourceId = 167;
const sourceName = 'Смаколики';
const baseUrl = 'https://smakolykytl.site/';

const popularNovels = async (page: number, { showLatestNovels }) => {
  const url = showLatestNovels
    ? 'https://api.smakolykytl.site/api/user/updates'
    : 'https://api.smakolykytl.site/api/user/projects';

  const result = await fetch(url);
  const json = (await result.json()) as response;

  const novels: SourceNovelItem[] = [];

  (json?.projects || json?.updates)?.forEach(novel =>
    novels.push({
      sourceId,
      novelName: novel.title,
      novelCover: novel.image.url,
      novelUrl: baseUrl + 'titles/' + novel.id,
    }),
  );

  return { novels };
};

const parseNovelAndChapters = async (novelUrl: string) => {
  const id = novelUrl.split('/').pop();
  const result = await fetch(
    'https://api.smakolykytl.site/api/user/projects/' + id,
  );
  const book = (await result.json()) as response;

  const novel: SourceNovel = {
    sourceId,
    sourceName,
    novelUrl,
    url: novelUrl,
    novelName: book?.project?.title,
    novelCover: book?.project?.image?.url,
    summary: book?.project?.description,
    chapters: [],
    author: book?.project?.author,
    status: book?.project?.status_translate.includes('Триває')
      ? Status.ONGOING
      : Status.COMPLETED,
  };
  let genre = [book?.project?.genres, book?.project?.tags]
    .flat()
    .map(tags => tags?.title)
    .filter(tags => tags);

  if (genre.length > 0) {
    novel.genre = genre.join(', ');
  }

  const res = await fetch(
    'https://api.smakolykytl.site/api/user/projects/' + id + '/books',
  );
  const data = (await res.json()) as response;

  data?.books?.forEach(volume =>
    volume?.chapters?.map(chapter =>
      novel.chapters.push({
        chapterName: volume.title + ' ' + chapter.title,
        releaseDate: dayjs(chapter.modifiedAt).format('LLL'),
        chapterUrl: baseUrl + 'read/' + chapter.id,
      }),
    ),
  );

  return novel;
};

const parseChapter = async (novelUrl: string, chapterUrl: string) => {
  const id = chapterUrl.split('/').pop();

  const result = await fetch(
    'https://api.smakolykytl.site/api/user/chapters/' + id,
  );
  const json = (await result.json()) as response;
  const chapterRaw: HTML[] = JSON.parse(json?.chapter?.content || '[]');

  const chapter: SourceChapter = {
    sourceId,
    novelUrl,
    chapterUrl,
    chapterName: json?.chapter?.title,
    chapterText: jsonToHtml(chapterRaw),
  };

  return chapter;
};

const searchNovels = async (searchTerm: string) => {
  const result = await fetch('https://api.smakolykytl.site/api/user/projects');
  const json = (await result.json()) as response;
  const novels: SourceNovelItem[] = [];

  json?.projects
    ?.filter(
      novel =>
        novel.title.includes(searchTerm) || String(novel.id) === searchTerm,
    )
    ?.forEach(novel =>
      novels.push({
        sourceId,
        novelName: novel.title,
        novelCover: novel.image.url,
        novelUrl: baseUrl + 'titles/' + novel.id,
      }),
    );
  return novels;
};

function jsonToHtml(json: HTML[], html: string = '') {
  json.forEach(element => {
    switch (element.type) {
      case 'hardBreak':
        html += '<br>';
        break;
      case 'horizontalRule':
        html += '<hr>';
        break;
      case 'image':
        if (element.attrs) {
          const attrs = Object.entries(element.attrs)
            .filter(attr => attr?.[1])
            .map(attr => `${attr[0]}="${attr[1]}"`);
          html += '<img ' + attrs.join('; ') + '>';
        }
        break;
      case 'paragraph':
        html +=
          '<p>' +
          (element.content ? jsonToHtml(element.content) : '<br>') +
          '</p>';
        break;
      case 'text':
        html += element.text;
        break;
      default:
        html += JSON.stringify(element, null, '\t'); //maybe I missed something.
        break;
    }
  });
  return html;
}

interface response {
  projects?: TopLevelProject[];
  updates?: Update[];
  project?: TopLevelProject;
  books?: BookElement[];
  chapter?: TopLevelChapter;
}

interface BookElement {
  id: number;
  rank: number;
  title: string;
  chapters: PurpleChapter[];
}

interface PurpleChapter {
  id: number;
  title: string;
  rank: string;
  modifiedAt: Date;
}

interface TopLevelChapter {
  id: number;
  title: string;
  rank: string;
  content: string;
  modifiedAt: Date;
  book: ChapterBook;
}

interface ChapterBook {
  id: number;
  rank: number;
  title: string;
  chapters: FluffyChapter[];
  project: BookProject;
}

interface FluffyChapter {
  id: number;
  rank: string;
}

interface BookProject {
  id: number;
}

interface TopLevelProject {
  id: number;
  title: string;
  description: string;
  author: string;
  translator: string;
  modifiedAt: Date;
  alternatives: string;
  release: string;
  nation: string;
  status: string;
  status_translate: string;
  image: Image;
  tags?: Genre[];
  genres?: Genre[];
}

interface Genre {
  id: number;
  title: string;
}

interface Image {
  id: number;
  url: string;
  name: string;
}

interface Update {
  id: number;
  title: string;
  author: string;
  translator: string;
  modifiedAt: Date;
  image: Image;
}

interface HTML {
  type: string;
  content?: HTML[];
  attrs?: Attrs;
  text?: string;
}

interface Attrs {
  src: string;
  alt: string | null;
  title: string | null;
}

const SmakolykyTlScraper = {
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default SmakolykyTlScraper;
