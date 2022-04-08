const path = require('path');
const fs = require('fs');

const MadaraSources = require('../src/sources/multisrc/madara/MadaraSources.json');
const AllSources = require('../src/sources/sources.json');

const getScraperName = scraperName => {
  let name = scraperName.replace(/\./g, 'Dot').replace('1st', 'First');

  return name;
};

let content =
  "/**\n * This file is auto-generated\n */\n\nimport MadaraScraper from './MadaraScraper';\n\n";

MadaraSources.forEach(source => {
  content =
    content +
    `export const ${getScraperName(
      source.sourceName,
    )}Scraper = new MadaraScraper(${source.sourceId}, "${source.baseUrl}", "${
      source.sourceName
    }", ${source.options ? JSON.stringify(source.options) : ''});\n\n`;
});

fs.writeFile(
  path.resolve(process.cwd(), 'src/sources/multisrc/madara/MadaraGenerator.ts'),
  content,
  error => {
    if (error) {
      console.log(error);
    }
  },
);

MadaraSources.forEach(madaraSource => {
  if (!AllSources.some(source => source.sourceId === madaraSource.sourceId)) {
    let allSourcesContent = AllSources;

    allSourcesContent.push({
      sourceId: madaraSource.sourceId,
      sourceName: madaraSource.sourceName,
      icon: `https://github.com/LNReader/lnreader-sources/blob/main/multisrc/madara/icons/${madaraSource.sourceName.toLowerCase()}.png?raw=true`,
      url: madaraSource.baseUrl,
      lang: madaraSource.options.lang || 'English',
    });

    allSourcesContent = JSON.stringify(allSourcesContent);

    fs.writeFile(
      path.resolve(process.cwd(), 'src/sources/sources.json'),
      allSourcesContent,
      error => {
        if (error) {
          console.log(error);
        }
      },
    );
  }
});
