const select = key => {
  return document.querySelector(key);
};

const chapter = select('chapter');
const clientWidth = document.documentElement.clientWidth;
let page = chapter?.getAttribute('data-page');
let pages = 0;
function tapChapter(event) {
  let bounds = document.querySelector('html').getBoundingClientRect();
  let { clientX, clientY } = event;
  let { x, y } = { x: clientX / bounds.width, y: clientY / bounds.height };

  let textWidth = chapter.scrollWidth;

  pages = Math.ceil(textWidth / bounds.width) - 1;
  if (pages === null || (pages < 0 && textWidth !== clientWidth)) {
    return;
  }
  chapter.setAttribute('data-pages', pages);

  if (y < 0.2) {
    movePage('prev');
  } else if (y > 0.8) {
    movePage('next');
  } else if (x < 0.33) {
    movePage('prev');
  } else if (x > 0.66) {
    movePage('next');
  } else {
    movePage();
  }
}

function movePage(panel) {
  page = chapter?.getAttribute('data-page');
  if (isNaN(page)) {
    page = 0;
  }
  switch (panel) {
    case 'next':
      if (page == pages) reader.post({ type: 'next' });
      else page++;
      break;
    case 'prev':
      if (page == 0) reader.post({ type: 'prev' });
      else page--;
      break;
    default:
      reader.post({ type: 'hide' });
      break;
  }

  chapter.style.transform = 'translate(-' + page * 100 + '%)';
  select('chapter').setAttribute('data-page', page);
}
