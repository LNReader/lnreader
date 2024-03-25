const id = key => {
  return document.getElementById(key);
};
const select = key => {
  return document.querySelector(key);
};

const chapter = select('chapter');
const clientWidth = document.documentElement.clientWidth;
const textWidth = chapter.scrollWidth;
const pages = Math.ceil(textWidth / clientWidth) - 2;
function tapChapter(event) {
  let bounds = document.querySelector('html').getBoundingClientRect();
  let x = event.clientX;
  let y = event.clientY;
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

// const navLeft = id('left');
// const navRight = id('right');
// const infoBox = id('infoContainer');
// infoBox.classList.add('hidden');

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
  console.log(page + '/' + pages);
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
