const bounds = document.querySelector('html').getBoundingClientRect();
var page = 0;
var pages = 0;

function setPages(newPages) {
  if (newPages) {
    pages = newPages;
    return;
  }
  const textWidth = chapter.scrollWidth;
  const layoutWidth = parseInt(
    document.querySelector('html').getBoundingClientRect().width,
    10,
  );
  pages = Math.round(textWidth / layoutWidth) - 1;
}
function setPage(newPage) {
  page = newPage ?? 0;
}
function getPages() {
  return pages;
}
function getPage() {
  return page;
}
function tapChapter(event) {
  const { clientX, clientY } = event;
  const { x, y } = { x: clientX / bounds.width, y: clientY / bounds.height };

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
  switch (panel) {
    case 'next':
      if (page === pages) {
        reader.post({ type: 'next' });
      } else {
        page++;
      }
      break;
    case 'prev':
      if (page === 0) {
        reader.post({ type: 'prev' });
      } else {
        page--;
      }
      break;
    default:
      reader.post({ type: 'hide' });
      break;
  }

  chapter.style.transform = 'translate(-' + page * 100 + '%)';
}
