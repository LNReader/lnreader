/**
 * https://fonts.google.com/icons
 * Filled
 * other settings are default
 */
const copyIcon =
  '<svg height="24" viewBox="0 -960 960 960" width="24"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Z"/></svg>';
const volumeIcon =
  '<svg height="24" viewBox="0 -960 960 960" width="24"><path d="M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm440 40v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320Z"/></svg>';
const selectAllIcon =
  '<svg height="24" viewBox="0 -960 960 960" width="24"><path d="M280-280v-400h400v400H280Zm80-80h240v-240H360v240ZM200-200v80q-33 0-56.5-23.5T120-200h80Zm-80-80v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80Zm80-160h-80q0-33 23.5-56.5T200-840v80Zm80 640v-80h80v80h-80Zm0-640v-80h80v80h-80Zm160 640v-80h80v80h-80Zm0-640v-80h80v80h-80Zm160 640v-80h80v80h-80Zm0-640v-80h80v80h-80Zm160 640v-80h80q0 33-23.5 56.5T760-120Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80q33 0 56.5 23.5T840-760h-80Z"/></svg>';
const resumeIcon =
  '<svg height="24" viewBox="0 -960 960 960" width="24"><path d="M240-240v-480h80v480h-80Zm160 0 400-240-400-240v480Z"/></svg>';
const pauseIcon =
  '<svg height="24" viewBox="0 -960 960 960" width="24"><path d="M560-200v-560h160v560H560Zm-320 0v-560h160v560H240Z"/></svg>';
const selectVolumeIcon =
  '<svg height="24" viewBox="0 -960 960 960" width="24"><path d="M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131Zm-80-29L280-360H120v-240h160l200-200v640Zm80-160v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320ZM40-680v-240h240v80H120v160H40ZM680-40v-80h160v-160h80v240H680Z"/></svg>';
/**
 * @type {import("./type").Reader}
 */
class Reader {
  constructor(swipeHandler, toolWrapper) {
    this.swipeHandler = swipeHandler;
    this.toolWrapper = toolWrapper;

    this.selection = window.getSelection();
    this.viewport = document.querySelector('meta[name=viewport]');
    this.footerWrapper = document.getElementById('reader-footer-wrapper');
    this.percentage = document.getElementById('reader-percentage');
    this.battery = document.getElementById('reader-battery');
    this.time = document.getElementById('reader-time');
    this.paddingTop = parseInt(
      getComputedStyle(document.querySelector('html')).getPropertyValue(
        'padding-top',
      ),
      10,
    );
    this.chapter = document.querySelector('chapter');
    this.rawHTML = this.chapter.innerHTML;
    this.chapterHeight = this.chapter.scrollHeight + this.paddingTop;
    this.layoutHeight = window.innerHeight;
    this.pluginId = getInt('plugin-id');
    this.novelId = getInt('novel-id');
    this.chapterId = getInt('chapter-id');
    this.chapterWidth = this.chapter.scrollWidth;
    this.layoutWidth = window.innerWidth;
    this.pageReader = this.chapter.getAttribute('data-page-reader') === 'true';
    this.saveProgressInterval = setInterval(() => {
      if (!this.pageReader) {
        this.post({
          type: 'save',
          data: parseInt(
            ((window.scrollY + this.layoutHeight) / this.chapterHeight) * 100,
            10,
          ),
        });
      } else {
        this.post({
          type: 'save',
          data: parseInt((getPage() / getPages()) * 100, 10),
        });
      }
    }, autoSaveInterval);
    this.time.innerText = new Date().toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    this.timeInterval = setInterval(() => {
      this.time.innerText = new Date().toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }, 10000);
    this.updateBatteryLevel(batteryLevel);
    this.updateGeneralSettings(initSettings);
  }
  refresh = () => {
    if (!this.pageReader) {
      this.chapterHeight = this.chapter.scrollHeight + this.paddingTop;
    } else {
      this.percentage.innerText = getPage() + 1 + '/' + (getPages() + 1);
      this.chapterWidth = this.chapter.scrollWidth;
    }
  };
  post = obj => window.ReactNativeWebView.postMessage(JSON.stringify(obj));
  updateReaderSettings = settings => {
    document.documentElement.style.setProperty(
      '--readerSettings-theme',
      settings.theme,
    );
    document.documentElement.style.setProperty(
      '--readerSettings-padding',
      settings.padding + '%',
    );
    document.documentElement.style.setProperty(
      '--readerSettings-textSize',
      settings.textSize + 'px',
    );
    document.documentElement.style.setProperty(
      '--readerSettings-textColor',
      settings.textColor,
    );
    document.documentElement.style.setProperty(
      '--readerSettings-textAlign',
      settings.textAlign,
    );
    document.documentElement.style.setProperty(
      '--readerSettings-lineHeight',
      settings.lineHeight,
    );
    document.documentElement.style.setProperty(
      '--readerSettings-fontFamily',
      settings.fontFamily,
    );
    if (settings.fontFamily) {
      new FontFace(
        settings.fontFamily,
        'url("file:///android_asset/fonts/' + settings.fontFamily + '.ttf")',
      )
        .load()
        .then(function (loadedFont) {
          document.fonts.add(loadedFont);
        });
    } else {
      // have no affect with a font declared in head
      document.fonts.forEach(fontFace => document.fonts.delete(fontFace));
    }
  };
  updateGeneralSettings = settings => {
    this.showScrollPercentage = settings.showScrollPercentage;
    this.showBatteryAndTime = settings.showBatteryAndTime;
    this.verticalSeekbar = settings.verticalSeekbar;
    this.bionicReading = settings.bionicReading;
    if (this.bionicReading) {
      this.chapter.innerHTML = textVide.textVide(this.rawHTML);
    } else {
      this.chapter.innerHTML = this.rawHTML;
    }
    if (settings.swipeGestures) {
      this.swipeHandler.enable();
    } else {
      this.swipeHandler.disable();
    }
    if (!this.showScrollPercentage && !this.showBatteryAndTime) {
      this.footerWrapper.classList.add('d-none');
    } else {
      this.footerWrapper.classList.remove('d-none');
      if (this.showScrollPercentage) {
        this.percentage.classList.remove('hidden');
      } else {
        this.percentage.classList.add('hidden');
      }
      if (this.showBatteryAndTime) {
        this.battery.classList.remove('hidden');
        this.time.classList.remove('hidden');
      } else {
        this.battery.classList.add('hidden');
        this.time.classList.add('hidden');
      }
    }
    if (!this.verticalSeekbar) {
      this.toolWrapper.$.classList.add('horizontal');
    } else {
      this.toolWrapper.$.classList.remove('horizontal');
    }
  };
  updateBatteryLevel = level => {
    this.battery.innerText = Math.ceil(level * 100) + '%';
  };
}

class ToolWrapper {
  constructor() {
    this.$ = document.getElementById('ToolWrapper');
    this.$.onclick = e => {
      e.stopPropagation();
    };
    this.tools = [];
  }
  hide = () => {
    this.$.classList.add('hidden');
    this.visible = false;
  };
  show = () => {
    this.$.classList.remove('hidden');
    this.visible = true;
    for (const tool of this.tools) {
      tool.onShow?.();
    }
  };
}

class ScrollHandler {
  constructor(reader, toolWrapper) {
    this.reader = reader;
    this.toolWrapper = toolWrapper;
    this.$ = document.getElementById('ScrollBar');
    this.$.innerHTML = `
        <div class="scrollbar-item scrollbar-text" id="scrollbar-percentage">
          0
        </div>
        <div class="scrollbar-item" id="scrollbar-slider">
          <div id="scrollbar-track">
            <div id="scrollbar-progress">
              <div id="scrollbar-thumb-wrapper"> 
                <div id="scrollbar-thumb"></div>
              </div>
            </div>
          </div>
          
        </div>
        <div id="scrollbar-percentage-max" class="scrollbar-item scrollbar-text">
          100
        </div>
      `;
    this.percentage = this.$.querySelector('#scrollbar-percentage');
    this.percentageMax = this.$.querySelector('#scrollbar-percentage-max');
    this.progress = this.$.querySelector('#scrollbar-progress');
    this.thumb = this.$.querySelector('#scrollbar-thumb-wrapper');
    this.slider = this.$.querySelector('#scrollbar-slider');
    this.sliderHeight = this.slider.clientHeight;
    this.sliderOffsetY = this.slider.getBoundingClientRect().top;
    this.lock = false;
    window.onscroll = () => !this.lock && this.update();
    window.ontouchend = () => !this.lock && this.update();
    this.thumb.ontouchstart = () => (this.lock = true);
    this.thumb.ontouchend = () => (this.lock = false);
    this.thumb.ontouchmove = e => {
      const ratio =
        ((this.reader.verticalSeekbar
          ? e.changedTouches[0].clientY
          : e.changedTouches[0].clientX) -
          this.sliderOffsetY) /
        this.sliderHeight;
      this.update(ratio < 0 ? 0 : ratio);
    };
  }
  update = ratio => {
    if (this.reader.pageReader) {
      setTimeout(() => this.updateHorizontal(ratio), 10);
    } else {
      this.updateVertical(ratio);
    }
  };
  updateHorizontal = ratio => {
    this.reader.refresh();
    const totalPages = getPages();
    const currentPage = getPage();

    this.percentageMax.innerHTML = totalPages + 1;
    const percentage = parseInt((currentPage / totalPages) * 100, 10);
    if (this.toolWrapper.visible) {
      if (this.reader.verticalSeekbar) {
        this.progress.style.height = percentage + '%';
        this.progress.style.width = '100%';
      } else {
        this.progress.style.height = '100%';
        this.progress.style.width = percentage + '%';
      }
      this.percentage.innerText = currentPage + 1;
    }
    if (this.lock) {
      let newPage = parseInt(totalPages * ratio, 10);
      newPage = newPage > totalPages ? totalPages : newPage;
      setPage(newPage);
      this.reader.chapter.style.transform =
        'translate(-' + newPage * 100 + '%)';
    }
    if (this.reader.percentage) {
      this.reader.refresh();
    }
  };

  updateVertical = ratio => {
    if (ratio === undefined) {
      ratio =
        (window.scrollY + this.reader.layoutHeight) / this.reader.chapterHeight;
    }
    if (ratio > 1) {
      ratio = 1;
    }
    const percentage = parseInt(ratio * 100, 10);
    if (this.toolWrapper.visible) {
      if (this.reader.verticalSeekbar) {
        this.progress.style.height = percentage + '%';
        this.progress.style.width = '100%';
      } else {
        this.progress.style.height = '100%';
        this.progress.style.width = percentage + '%';
      }
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
    if (this.reader.verticalSeekbar) {
      this.sliderHeight = this.slider.clientHeight;
      this.sliderOffsetY = this.slider.getBoundingClientRect().top;
    } else {
      this.sliderHeight = this.slider.clientWidth;
      this.sliderOffsetY = this.slider.getBoundingClientRect().left;
    }
  };
  onShow = () => {
    this.reader.refresh();
    this.refresh();
    this.update();
  };
  onDOMCreation = progress => {
    this.onShow();
    if (this.reader.pageReader) {
      const totalPages = getPages();
      let page = Math.round((totalPages * progress) / 100);
      setPage(page >= totalPages ? totalPages : page);
      this.reader.chapter.style.transform = 'translate(-' + page * 100 + '%)';
    } else {
      window.scrollTo({
        top:
          (this.reader.chapterHeight * progress) / 100 -
          this.reader.layoutHeight,
        behavior: 'smooth',
      });
    }
  };
}

class SwipeHandler {
  constructor() {
    this.initialX = null;
    this.initialY = null;
  }

  touchStartHandler = e => {
    this.initialX = e.changedTouches[0].screenX;
    this.initialY = e.changedTouches[0].screenY;
  };

  /**
   * @param {TouchEvent} e
   */
  touchEndHandler = e => {
    let diffX = e.changedTouches[0].screenX - this.initialX;
    let diffY = e.changedTouches[0].screenY - this.initialY;
    if (
      e.target.id?.startsWith('scrollbar') ||
      e.target.id === 'Image-Modal-img'
    ) {
      return;
    }
    if (Math.abs(diffX) > Math.abs(diffY) * 2 && Math.abs(diffX) > 180) {
      if (diffX < 0 && this.initialX >= window.innerWidth / 2) {
        e.preventDefault();
        reader.post({ type: 'next' });
      } else if (diffX > 0 && this.initialX <= window.innerWidth / 2) {
        e.preventDefault();
        reader.post({ type: 'prev' });
      }
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

/**
 * @type {import('./type').TextToSpeech}
 */

// Walk through all leave -> convert each leaf to list of tts elements -> read through all tts elements
class TextToSpeech {
  constructor(reader) {
    this.reader = reader;
    this.readableNodeNames = ['#text', 'B', 'I', 'SPAN', 'EM', 'BR', 'STRONG'];
    this.leaf = this.reader.chapter;
    this.reading = false;
    this.started = false;
    this.$ = document.getElementById('TTS-Controller');
    this.$.classList.add('d-none');
    this.$.onclick = () => {
      if (this.reading) {
        this.pause();
      } else {
        this.resume();
      }
    };
  }

  start = () => {
    this.started = false;
    this.$.innerHTML = `<button>${pauseIcon}</button>`;
    this.$.classList.remove('d-none');
    this.stop();
    this.leaf = this.reader.chapter;
    this.next();
  };

  startHere = () => {
    this.$.innerHTML = `<button>${pauseIcon}</button>`;
    this.$.classList.remove('d-none');
    this.stop();
    if (this.reader.selection.type === 'Range') {
      this.leaf = this.reader.selection.anchorNode;
      while (this.readableNodeNames.includes(this.leaf.nodeName)) {
        this.leaf = this.leaf.parentNode;
      }
      this.reader.selection.removeAllRanges();
      this.speak();
    } else {
      this.next();
    }
  };

  resume = () => {
    this.$.innerHTML = `<button>${pauseIcon}</button>`;
    this.next();
  };

  readable() {
    if (
      this.leaf.nodeName !== 'SPAN' &&
      this.readableNodeNames.includes(this.leaf.nodeName)
    ) {
      return false;
    }
    if (!this.leaf.hasChildNodes()) {
      return false;
    }
    for (let i = 0; i < this.leaf.childNodes.length; i++) {
      if (
        !this.readableNodeNames.includes(this.leaf.childNodes.item(i).nodeName)
      ) {
        return false;
      }
    }
    return true;
  }

  findNextTextNode() {
    do {
      if (this.reader.chapter.isSameNode(this.leaf)) {
        this.leaf = this.leaf.firstElementChild;
      } else {
        if (this.leaf.firstElementChild) {
          this.leaf = this.leaf.firstElementChild;
        } else if (this.leaf.nextElementSibling) {
          this.leaf = this.leaf.nextElementSibling;
        } else {
          this.leaf = this.leaf.parentElement;
        }
      }
    } while (!this.readable());
    if (this.reader.chapter.isSameNode(this.leaf)) {
      return;
    }
  }

  next = () => {
    try {
      this.leaf?.classList?.remove('highlight');
      if (this.reading) {
        if (this.leaf.nextElementSibling) {
          this.leaf = this.leaf.nextElementSibling;
        } else {
          this.findNextTextNode();
        }
      } else if (!this.started) {
        this.findNextTextNode();
        this.started = true;
      }
      this.speak();
    } catch (e) {
      alert(e);
    }
  };

  stop = () => {
    this.reader.post({ type: 'stop-speak' });
    this.$.classList.add('d-none');
    this.leaf?.classList?.remove('highlight');
    this.reading = false;
  };

  pause = () => {
    this.$.innerHTML = `<button>${resumeIcon}</button>`;
    this.reading = false;
    this.reader.post({ type: 'stop-speak' });
  };

  speak = () => {
    this.reading = true;
    if (this.reader.chapter.isSameNode(this.leaf)) {
      return;
    }
    this.leaf.classList.add('highlight');
    this.reader.post({ type: 'speak', data: this.leaf?.innerText });
  };
}

/**
 * @type {import("./type").ContextMenu}
 */
class ContextMenu {
  /**
   * @param {import("./type").Reader} reader
   */
  constructor(reader) {
    this.reader = reader;
    this.items = {
      START_READING: this.renderItem({
        name: 'Start Reading',
        icon: volumeIcon,
        action: () => {
          this.closeMenu();
          tts.start();
        },
      }),
      START_HERE: this.renderItem({
        name: 'Start Here',
        icon: selectVolumeIcon,
        action: () => {
          this.closeMenu();
          tts.startHere();
        },
      }),
      COPY: this.renderItem({
        name: 'Copy',
        icon: copyIcon,
        action: () => {
          this.closeMenu();
          this.reader.post({
            type: 'copy',
            data: this.reader.selection.toString(),
          });
        },
      }),
      SELECT_ALL: this.renderItem({
        name: 'Select All',
        icon: selectAllIcon,
        action: () => {
          const range = document.createRange();
          range.selectNodeContents(this.reader.chapter);
          this.reader.selection.removeAllRanges();
          this.reader.selection.addRange(range);
        },
      }),
    };
    this.commonItems = [this.items.COPY, this.items.SELECT_ALL];
    this.contextMenu = document.createElement('ul');
    this.contextMenu.classList.add('contextMenu');
    this.isOpened = false;
  }

  /**
   * @param {{name: string, icon: string, action: () => void}} data
   * @returns
   */
  renderItem(data) {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.innerHTML = `${data.icon} <span>${data.name}</span>`;
    button.classList.add('contextMenu-button');
    item.classList.add('contextMenu-item');
    item.appendChild(button);
    button.addEventListener('click', event => {
      event.stopPropagation();
      data.action();
    });
    return item;
  }

  renderMenu(items) {
    this.contextMenu.innerHTML = '';
    items.concat(this.commonItems).forEach((item, index) => {
      item.firstChild.setAttribute('style', `animation-delay: ${index * 0.1}s`);
      this.contextMenu.appendChild(item);
    });
  }

  closeMenu() {
    if (this.isOpened) {
      this.isOpened = false;
      this.contextMenu.remove();
    }
  }

  init() {
    this.reader.chapter.addEventListener('click', () => {
      this.closeMenu(this.contextMenu);
    });
    document.addEventListener('contextmenu', e => {
      e.preventDefault();
      if (e.target instanceof HTMLImageElement) {
        if (imageModal.showing) {
          imageModal.hide();
        } else {
          imageModal.show(e.target);
        }
        return;
      }
      this.isOpened = true;
      if (this.reader.selection.type === 'Range') {
        this.renderMenu([this.items.START_HERE, this.items.START_READING]);
      } else {
        this.renderMenu([this.items.START_READING]);
      }
      const { clientX, clientY } = e;
      e.target.appendChild(this.contextMenu);
      const positionY =
        clientY + this.contextMenu.scrollHeight >= window.innerHeight
          ? window.innerHeight - this.contextMenu.scrollHeight - 20
          : clientY;
      const positionX =
        clientX + this.contextMenu.scrollWidth >= window.innerWidth
          ? window.innerWidth - this.contextMenu.scrollWidth - 20
          : clientX;
      const page = getPage();
      this.contextMenu.setAttribute(
        'style',
        `--width: ${this.contextMenu.scrollWidth}px;
        --height: ${this.contextMenu.scrollHeight}px;
        --top: ${positionY}px;
        --left: ${positionX + window.innerWidth * page}px;`,
      );
    });
  }
}

/**
 * @type {import("./type").ImageModal}
 */
class ImageModal {
  /**
   * @param {import('./type').Reader} reader
   */
  constructor(reader) {
    this.reader = reader;
    this.$ = document.getElementById('Image-Modal');
    this.img = this.$.querySelector('img');
    this.showing = false;
    this.$.onclick = e => {
      if (e.target.id !== 'Image-Modal-img') {
        e.stopPropagation();
        this.hide();
      }
    };
    this.$.ontouchmove = e => {
      e.stopImmediatePropagation();
    };
  }

  /**
   *
   * @param {HTMLImageElement} image
   */
  show(image) {
    this.img.src = image.src;
    this.img.alt = `Can not render image from ${image.src}`;
    this.reader.viewport.setAttribute(
      'content',
      'width=device-width, initial-scale=1.0, maximum-scale=10',
    );
    this.$.classList.add('show');
    this.showing = true;
  }
  hide() {
    this.$.classList.remove('show');
    this.showing = false;
    this.img.src = '';
    this.img.alt = '';
    this.reader.viewport.setAttribute(
      'content',
      'width=device-width, initial-scale=1.0, maximum-scale=1.0',
    );
  }
}

try {
  var swipeHandler = new SwipeHandler();
  var toolWrapper = new ToolWrapper();
  var reader = new Reader(swipeHandler, toolWrapper);
  var scrollHandler = new ScrollHandler(reader, toolWrapper);
  var tts = new TextToSpeech(reader);
  toolWrapper.tools = [scrollHandler, tts];
  var imageModal = new ImageModal(reader);
  var contextMenu = new ContextMenu(reader);
  contextMenu.init();
} catch (e) {
  alert(e);
}
