const fetch = require('node-fetch')
const fs = require('fs').promises;
const path = require('path');

fs.readFile('../src/sources/multisrc/noveltl/NovelTlGenerator.js').then(
  async data => {
    let links = data
      .toString()
      .split('\n')
      .flatMap(item => item.split("'"))
      .filter(item => item.startsWith('http'));

    let filters = {};
    for (let i = 0; i < links.length; i++) {
      let body = await fetch('https://api.novel.tl/api/site/v2/graphql', {
        method: 'post',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/111.0',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
          'Content-Type': 'application/json',
          'Alt-Used': 'api.novel.tl',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'cross-site',
        },
        referrer: links[i],
        body: JSON.stringify({
          query:
            'query TagsSuggested($hostname:String,$query:String){tags(filter:{sections:[{fullUrl:$hostname}]},query:$query){content{id nameRu nameEng}}}',
          variables: {
            query: '',
            hostname: links[i].split('//')[1],
          },
        }),
      });
      let json = await body.json();
      console.log(i + 1 + '/' + links.length);
      let tags = {
        key: 'tags',
        label: 'Тэги',
        values: json.data.tags.content
          .map(tags => ({
            label: tags?.nameRu || tags.nameEng,
            value: tags.id.toString(),
          }))
          .sort((a, b) => a.label.localeCompare(b.label)),
      };
      if (tags?.values.length > 0) {
        filters[links[i].split('//')[1]] = tags;
      }
    }

    fs.writeFile(
      '../src/sources/multisrc/noveltl/NovelTl.json',
      JSON.stringify(filters, null, '  '),
    );
  },
);
