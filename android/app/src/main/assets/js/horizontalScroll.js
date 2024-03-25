const id = key => {
  return document.getElementById(key);
};
const select = key => {
  return document.querySelector(key);
};

const chapter = select('chapter');
let clientWidth = document.documentElement.clientWidth;
let textWidth = chapter.scrollWidth;
let pages = Math.ceil(textWidth / clientWidth) - 2;
function tapChapter(event) {
  let bounds = document.querySelector('html').getBoundingClientRect();
  let x = event.clientX;
  let y = event.clientY;

  clientWidth = document.documentElement.clientWidth;
  textWidth = chapter.scrollWidth;
  pages = Math.ceil(textWidth / clientWidth) - 2;

  if (pages === null || (pages < 0 && textWidth !== clientWidth)) {
    return;
  }
  let page = select('chapter')?.getAttribute('data-page');

  //   alert(JSON.stringify({ x, y }, null, 2));
  if (x / bounds.width < 0.33) {
    // alert('T' + page);
    if (page > 0) {
      page--;
      movePage(page);
    } else {
      reader.post({ type: 'prev' });
    }
  } else if (x / bounds.width > 0.66) {
    if (isNaN(page)) {
      page = 0;
    }
    if (page < pages) {
      page++;
      movePage(page);
    } else {
      reader.post({ type: 'next' });
    }
  } else {
    reader.post({ type: 'hide' });
  }
}

function movePage(page) {
  chapter.style.transform = 'translate(-' + page * 100 + '%)';
  select('chapter').setAttribute('data-page', page);
  reader.post(
    JSON.stringify({
      type: 'scrollend',
      data: {
        offSetY: page * 100,
        percentage: page === 0 ? 1 : (page / pages) * 100,
      },
    }),
  );
}
let sendWidthTimeout;
const sendPages = timeOut => {
  clearTimeout(sendHeightTimeout);
  sendHeightTimeout = setTimeout(
    reader.post(JSON.stringify({ type: 'pages', data: pages })),
    timeOut,
  );
};
sendPages(200);
