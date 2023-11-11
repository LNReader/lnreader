import { sortBy, uniq } from 'lodash-es';

import { ParsedSource, Source } from '@sourcesV2/types';

export class AbstractSourceFactory {
  protected sources: Map<number, ParsedSource>;

  constructor() {
    this.sources = new Map();
  }

  registerSource(source: ParsedSource) {
    this.sources.set(source.id, source);
  }

  getSources() {
    let sources: Source[] = [];

    this.sources.forEach(source =>
      sources.push({
        id: source.id,
        name: source.name,
        iconUrl: source.iconUrl,
        lang: source.lang,
        baseUrl: source.baseUrl,
      }),
    );

    sources = sortBy(sources, 'name');

    return sources;
  }

  getSource(id: number) {
    return this.sources.get(id);
  }

  getSourceLang(id: number) {
    return this.sources.get(id)?.lang;
  }

  getSourceName(id: number) {
    return this.sources.get(id)?.name;
  }

  getLanguages() {
    const languages: string[] = [];

    this.sources.forEach(source => languages.push(source.lang));

    return uniq(languages);
  }
}
