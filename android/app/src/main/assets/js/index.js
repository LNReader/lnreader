function Reader() {
  this.init = () => {
    this.percentage =
      showScrollPercentage && document.getElementById('reader-percentage');
    this.paddingTop = parseInt(
      getComputedStyle(document.querySelector('html')).getPropertyValue(
        'padding-top',
      ),
    );
    this.chapter = document.querySelector('chapter');
    this.chapterHeight = this.chapter.scrollHeight + this.paddingTop;
    this.layoutHeight = window.innerHeight;
    this.pluginId = this.chapter.getAttribute('data-plugin-id');
    this.novelId = this.chapter.getAttribute('data-novel-id');
    this.chapterId = this.chapter.getAttribute('data-chapter-id');
  };
  this.refresh = () => {
    this.chapterHeight = this.chapter.scrollHeight + this.paddingTop;
  };
  this.post = obj => window.ReactNativeWebView.postMessage(JSON.stringify(obj));
  this.init();
  this.saveProgressInterval = setInterval(
    () =>
      reader.post({
        type: 'save',
        data: {
          offsetY: window.scrollY,
          percentage: parseInt(
            ((window.scrollY + this.layoutHeight) / this.chapterHeight) * 100,
          ),
        },
      }),
    autoSaveInterval,
  );
}

function ScrollHandler() {
  this.init = () => {
    this.$ = document.getElementById('ScrollBar');
    this.$.innerHTML =
      '<div class="scrollbar-item scrollbar-text d-none" id="scrollbar-percentage">0</div><div class="scrollbar-item" id="scrollbar-slider"><div id="scrollbar-track"></div><div id="scrollbar-progress"><div id="scrollbar-thumb"></div></div></div><div class="scrollbar-item scrollbar-text">100</div>';
    this.percentage = this.$.querySelector('#scrollbar-percentage');
    this.progress = this.$.querySelector('#scrollbar-progress');
    this.thumb = this.$.querySelector('#scrollbar-thumb');
    this.slider = this.$.querySelector('#scrollbar-slider');
    this.sliderHeight = this.slider.clientHeight;
    this.sliderOffsetY = this.slider.offsetTop + this.$.offsetTop;
    this.lock = false;
    this.visible = false; // scrollbar
  };
  this.update = ratio => {
    if (ratio === undefined) {
      ratio = (window.scrollY + reader.layoutHeight) / reader.chapterHeight;
    }
    if (ratio > 1) {
      ratio = 1;
    }
    const percentage = parseInt(ratio * 100);
    if (this.visible) {
      this.progress.style.height = percentage + '%';
      this.percentage.innerText = percentage;
    }
    if (this.lock) {
      window.scrollTo({
        top: reader.chapterHeight * ratio - reader.layoutHeight,
        behavior: 'instant',
      });
    }
    if (reader.percentage) {
      reader.percentage.innerText = percentage + '%';
    }
  };
  this.refresh = () => {
    this.sliderHeight = this.slider.clientHeight;
    this.sliderOffsetY = this.slider.offsetTop + this.$.offsetTop;
  };
  this.hide = () => {
    this.$.classList.add('d-none');
    this.visible = false;
  };
  this.show = () => {
    reader.refresh();
    this.visible = true;
    this.$.classList.remove('d-none');
    this.refresh();
    this.update();
  };
  this.init();
  window.onscroll = () => !this.lock && this.update();
  this.thumb.ontouchstart = () => (this.lock = true);
  this.thumb.ontouchend = () => (this.lock = false);
  this.thumb.ontouchmove = e => {
    const ratio =
      (e.changedTouches[0].clientY - this.sliderOffsetY) / this.sliderHeight;
    this.update(ratio < 0 ? 0 : ratio);
  };
}

function SwipeHandler() {
  this.init = () => {
    this.initialX = null;
    this.initialY = null;
    if (swipeGestures) {
      this.enable();
    }
  };
  this.touchStartHandler = e => {
    this.initialX = e.changedTouches[0].screenX;
    this.initialY = e.changedTouches[0].screenY;
  };

  this.touchEndHandler = e => {
    let diffX = e.changedTouches[0].screenX - this.initialX;
    let diffY = e.changedTouches[0].screenY - this.initialY;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      e.preventDefault();
      reader.post({ type: diffX < 0 ? 'next' : 'prev' });
    }
  };

  this.enable = () => {
    document.addEventListener('touchstart', this.touchStartHandler);
    document.addEventListener('touchend', this.touchEndHandler);
  };

  this.disable = () => {
    document.removeEventListener('touchstart', this.touchStartHandler);
    document.removeEventListener('touchend', this.touchEndHandler);
  };

  this.init();
}

function TextToSpeech() {
  this.init = () => {
    this.elements = reader.chapter.querySelectorAll('t-t-s');
    this.previous = null;
  };

  this.play = index => {
    if (index >= 0 && index < this.elements.length) {
      if (this.previous !== null) {
        this.unhighlight(this.previous);
      }
      this.highlight(index);
      this.previous = index;
    }
  };

  this.highlight = index => {
    if (index >= 0 && index < this.elements.length) {
      this.elements[index].classList.add('tts-highlight');
    }
  };

  this.unhighlight = index => {
    if (index >= 0 && index < this.elements.length) {
      this.elements[index].classList.remove('tts-highlight');
    }
  };

  this.init();
}

const reader = new Reader();
const scrollHandler = new ScrollHandler();
const swipeHandler = new SwipeHandler();
const tts = new TextToSpeech();
