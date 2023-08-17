function Reader() {
  this.init = () => {
    this.percentage =
      showScrollPercentage && document.getElementById('reader-percentage');
    this.paddingBottom = parseInt(
      window.getComputedStyle(document.getElementsByTagName('body').item(0))
        .paddingBottom,
    );
    this.chapterHeight = document.body.scrollHeight - this.paddingBottom;
    this.layoutHeight = window.innerHeight;
    this.chapter = document.querySelector('chapter');
    this.pluginId = this.chapter.getAttribute('data-plugin-id');
    this.novelId = this.chapter.getAttribute('data-novel-id');
    this.chapterId = this.chapter.getAttribute('data-chapter-id');
  };
  this.refresh = () => {
    this.chapterHeight = document.body.scrollHeight - this.paddingBottom;
  };
  this.post = obj => window.ReactNativeWebView.postMessage(JSON.stringify(obj));
  this.init();
}

function ScrollBar() {
  this.init = () => {
    this.$ = document.getElementById('ScrollBar');
    this.$.innerHTML =
      '<div class="scrollbar-item scrollbar-text d-none" id="scrollbar-percentage">0</div><div class="scrollbar-item" id="scrollbar-slider"><div id="scrollbar-track"></div><div id="scrollbar-progress"><div id="scrollbar-thumb"></div></div></div><div class="scrollbar-item scrollbar-text">100</div>';
    this.percentage = this.$.querySelector('#scrollbar-percentage');
    this.progress = this.$.querySelector('#scrollbar-progress');
    this.thumb = this.$.querySelector('#scrollbar-thumb');
    this.slider = this.$.querySelector('#scrollbar-slider');
    this.sliderHeight = this.slider.clientHeight;
    this.offsetTop = this.slider.offsetTop + this.$.offsetTop;
  };
  this.update = ratio => {
    if (ratio > 1) {
      ratio = 1;
    }
    this.percentage.innerText = parseInt(
      (this.progress.style.height = ratio * 100 + '%'),
    );
    if (reader.percentage) {
      reader.percentage.innerText = this.percentage.innerText + '%';
    }
    if (this.lock) {
      window.scrollTo({
        top: reader.chapterHeight * ratio - reader.layoutHeight,
        behavior: 'instant',
      });
    }
  };
  this.refresh = () => {
    this.sliderHeight = this.slider.clientHeight;
    this.offsetTop = this.slider.offsetTop + this.$.offsetTop;
  };
  this.hide = () => this.$.classList.add('d-none');
  this.show = () => {
    reader.refresh();
    this.$.classList.remove('d-none');
    this.refresh();
  };
  this.init();
  window.onscroll = () =>
    !this.lock &&
    this.update((window.scrollY + reader.layoutHeight) / reader.chapterHeight);
  this.thumb.ontouchstart = () => (this.lock = 1);
  this.thumb.ontouchend = () => (this.lock = 0);
  this.thumb.ontouchmove = e => {
    let ratio =
      (e.changedTouches[0].clientY - this.offsetTop) / this.sliderHeight;
    this.update(ratio < 0 ? 0 : ratio);
  };
  this.saveProgressInterval = setInterval(
    () =>
      reader.post({
        type: 'save',
        data: {
          offsetY: window.pageYOffset,
          percentage: Number(this.percentage.innerText),
        },
      }),
    autoSaveInterval,
  );
}

const reader = new Reader();
const scrollbar = new ScrollBar();

if (swipeGestures) {
  let initialX = null;
  let initialY = null;
  document.addEventListener('touchstart', e => {
    initialX = e.changedTouches[0].screenX;
    initialY = e.changedTouches[0].screenY;
  });
  document.addEventListener('touchend', e => {
    let diffX = e.changedTouches[0].screenX - initialX;
    let diffY = e.changedTouches[0].screenY - initialY;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      e.preventDefault();
      reader.post({ type: diffX < 0 ? 'next' : 'prev' });
    }
  });
}
