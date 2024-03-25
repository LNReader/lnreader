const id = key => {
  return document.getElementById(key);
};
const select = key => {
  return document.querySelector(key);
};

const chapter = select('chapter');
const clientWidth = document.documentElement.clientWidth;
const textWidth = chapter.scrollWidth;
const pages = Math.ceil(textWidth / clientWidth) - 1;
let page = 0;
function tapChapter(event) {
  let bounds = document.querySelector('html').getBoundingClientRect();
  let x = event.clientX;
  let y = event.clientY;
  console.log('e');
  //   alert(JSON.stringify({ x, y }, null, 2));
  page = select('chapter')?.getAttribute('data-page');
  if (x / bounds.width < 0.33) {
    // alert('T' + page);
    if (page > 0) {
      page--;
      movePage();
    }
  } else if (x / bounds.width > 0.66) {
    if (isNaN(page)) {
      page = 0;
    }
    if (page < pages) {
      page++;
      movePage();
      if (page === pages) {
      }
    }
  } else {
    reader.post({ type: 'hide' });
  }
}

// const navLeft = id('left');
// const navRight = id('right');
// const infoBox = id('infoContainer');
// infoBox.classList.add('hidden');

function movePage() {
  chapter.style.transform = 'translate(-' + page * 100 + '%)';
  select('chapter').setAttribute('data-page', page);
  window.ReactNativeWebView.postMessage(
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
    window.ReactNativeWebView.postMessage(
      JSON.stringify({ type: 'pages', data: pages }),
    ),
    timeOut,
  );
};
// sendPages(200);
