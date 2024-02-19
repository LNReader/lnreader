class Reader {
  constructor() {
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
    this.saveProgressInterval = setInterval(
      () =>
        this.post({
          type: 'save',
          data: parseInt(
            ((window.scrollY + this.layoutHeight) / this.chapterHeight) * 100,
          ),
        }),
      autoSaveInterval,
    );
  }

  refresh = () => {
    this.chapterHeight = this.chapter.scrollHeight + this.paddingTop;
  };
  post = obj => window.ReactNativeWebView.postMessage(JSON.stringify(obj));
}
class ScrollHandler {
  constructor(reader) {
    this.reader = reader;
    this.$ = document.getElementById('ScrollBar');
    this.$.innerHTML = `
        <div class="scrollbar-item scrollbar-text d-none" id="scrollbar-percentage">
          0
        </div>
        <div class="scrollbar-item" id="scrollbar-slider">
          <div id="scrollbar-track">
          </div>
          <div id="scrollbar-progress">
            <div id="scrollbar-thumb-wrapper"> 
              <div id="scrollbar-thumb"></div>
            </div>
          </div>
        </div>
        <div class="scrollbar-item scrollbar-text">
          100
        </div>
      `;
    this.percentage = this.$.querySelector('#scrollbar-percentage');
    this.progress = this.$.querySelector('#scrollbar-progress');
    this.thumb = this.$.querySelector('#scrollbar-thumb-wrapper');
    this.slider = this.$.querySelector('#scrollbar-slider');
    this.sliderHeight = this.slider.clientHeight;
    this.sliderOffsetY = this.slider.offsetTop + this.$.offsetTop;
    this.lock = false;
    this.visible = false; // scrollbar
    window.onscroll = () => !this.lock && this.update();
    this.thumb.ontouchstart = () => (this.lock = true);
    this.thumb.ontouchend = () => (this.lock = false);
    this.thumb.ontouchmove = e => {
      const ratio =
        (e.changedTouches[0].clientY - this.sliderOffsetY) / this.sliderHeight;
      this.update(ratio < 0 ? 0 : ratio);
    };
  }
  update = ratio => {
    if (ratio === undefined) {
      ratio =
        (window.scrollY + this.reader.layoutHeight) / this.reader.chapterHeight;
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
        top: this.reader.chapterHeight * ratio - this.reader.layoutHeight,
        behavior: 'instant',
      });
    }
    if (this.reader.percentage) {
      this.reader.percentage.innerText = percentage + '%';
    }
  };
  refresh = () => {
    this.sliderHeight = this.slider.clientHeight;
    this.sliderOffsetY = this.slider.offsetTop + this.$.offsetTop;
  };
  hide = () => {
    this.$.classList.add('d-none');
    this.visible = false;
  };
  show = () => {
    this.reader.refresh();
    this.visible = true;
    this.$.classList.remove('d-none');
    this.refresh();
    this.update();
  };
}

class SwipeHandler {
  constructor(reader) {
    this.reader = reader;
    this.initialX = null;
    this.initialY = null;
    if (swipeGestures) {
      this.enable();
    }
  }

  touchStartHandler = e => {
    this.initialX = e.changedTouches[0].screenX;
    this.initialY = e.changedTouches[0].screenY;
  };

  touchEndHandler = e => {
    let diffX = e.changedTouches[0].screenX - this.initialX;
    let diffY = e.changedTouches[0].screenY - this.initialY;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      e.preventDefault();
      this.reader.post({ type: diffX < 0 ? 'next' : 'prev' });
    }
  };

  enable = () => {
    document.addEventListener('touchstart', this.touchStartHandler);
    document.addEventListener('touchend', this.touchEndHandler);
  };

  disable = () => {
    document.removeEventListener('touchstart', this.touchStartHandler);
    document.removeEventListener('touchend', this.touchEndHandler);
  };
}

class TextToSpeech {
  constructor(reader) {
    this.reader = reader;
    this.elements = this.reader.chapter.querySelectorAll('t-t-s');
    this.previous = null;
  }
  play = index => {
    if (index >= 0 && index < this.elements.length) {
      if (this.previous !== null) {
        this.unhighlight(this.previous);
      }
      this.highlight(index);
      this.previous = index;
    }
  };

  highlight = index => {
    if (index >= 0 && index < this.elements.length) {
      this.elements[index].classList.add('tts-highlight');
    }
  };

  unhighlight = index => {
    if (index >= 0 && index < this.elements.length) {
      this.elements[index].classList.remove('tts-highlight');
    }
  };
}

var reader = new Reader();
var scrollHandler = new ScrollHandler(reader);
var swipeHandler = new SwipeHandler(reader);
var tts = new TextToSpeech(reader);
