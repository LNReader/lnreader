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
const translateIcon =
  '<svg height="24" viewBox="0 -960 960 960" width="24"><path d="m476-80 182-480h84L924-80h-84l-43-122H603L560-80h-84ZM160-200l-56-56 202-202q-35-35-63.5-80T190-640h84q20 39 40 68t48 58q33-33 68.5-92.5T484-720H40v-80h280v-80h80v80h280v80H564q-21 72-63 148t-83 116l96 98-30 82-122-125-202 201Zm468-72h144l-72-204-72 204Z"/></svg>';
const resumeIcon =
  '<svg height="24" viewBox="0 -960 960 960" width="24"><path d="M240-240v-480h80v480h-80Zm160 0 400-240-400-240v480Z"/></svg>';
const pauseIcon =
  '<svg height="24" viewBox="0 -960 960 960" width="24"><path d="M560-200v-560h160v560H560Zm-320 0v-560h160v560H240Z"/></svg>';
const stopIcon =
  '<svg height="24" viewBox="0 -960 960 960" width="24"><path d="M320-320h320v-320H320v320ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/></svg>';
const selectVolumeIcon =
  '<svg height="24" viewBox="0 -960 960 960" width="24"><path d="M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131Zm-80-29L280-360H120v-240h160l200-200v640Zm80-160v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320ZM40-680v-240h240v80H120v160H40ZM680-40v-80h160v-160h80v240H680Z"/></svg>';
/**
 * @type {import("./type").Reader}
 */
class Reader {
  constructor() {
    this.selection = window.getSelection();
    this.footerWrapper = document.getElementById('reader-footer-wrapper');
    this.percentage = document.getElementById('reader-percentage');
    this.battery = document.getElementById('reader-battery');
    this.time = document.getElementById('reader-time');
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
    this.time.innerText = new Date().toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
    this.timeInterval = setInterval(() => {
      this.time.innerText = new Date().toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
    }, 60000);
    this.updateBatteryLevel(batteryLevel);
    this.updateGeneralSettings(initSettings);
  }

  refresh = () => {
    this.chapterHeight = this.chapter.scrollHeight + this.paddingTop;
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
    new FontFace(
      settings.fontFamily,
      'url("file:///android_asset/fonts/' + settings.fontFamily + '.ttf")',
    )
      .load()
      .then(function (loadedFont) {
        document.fonts.add(loadedFont);
      });
  };
  updateGeneralSettings = settings => {
    this.showScrollPercentage = settings.showScrollPercentage;
    this.showBatteryAndTime = settings.showBatteryAndTime;
    if (settings.swipeGestures) {
      swipeHandler.enable();
    } else {
      swipeHandler.disable();
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
        <div class="scrollbar-item scrollbar-text">
          100
        </div>
      `;
    this.percentage = this.$.querySelector('#scrollbar-percentage');
    this.progress = this.$.querySelector('#scrollbar-progress');
    this.thumb = this.$.querySelector('#scrollbar-thumb-wrapper');
    this.slider = this.$.querySelector('#scrollbar-slider');
    this.sliderHeight = this.slider.clientHeight;
    this.sliderOffsetY = this.slider.getBoundingClientRect().top;
    this.lock = false;
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
    if (this.toolWrapper.visible) {
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
    this.sliderOffsetY = this.slider.getBoundingClientRect().top;
  };
  onShow = () => {
    this.reader.refresh();
    this.refresh();
    this.update();
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

  touchEndHandler = e => {
    let diffX = e.changedTouches[0].screenX - this.initialX;
    let diffY = e.changedTouches[0].screenY - this.initialY;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      e.preventDefault();
      reader.post({ type: diffX < 0 ? 'next' : 'prev' });
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
class TextToSpeech {
  constructor(reader) {
    this.reader = reader;
    (this.leaf = this.reader.chapter), (this.TTSWrapper = null); // swap these 2 elements
    this.TTSEle = null;
    this.reading = false;
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
    this.$.innerHTML = `<button>${pauseIcon}</button>`;
    this.$.classList.remove('d-none');
    this.stop();
    this.next();
  };

  startHere = () => {
    this.$.innerHTML = `<button>${pauseIcon}</button>`;
    this.$.classList.remove('d-none');
    this.stop();
    if (this.reader.selection.type === 'Range') {
      if (this.leaf && this.TTSWrapper) {
        this.TTSWrapper.replaceWith(this.leaf);
      }
      this.leaf = this.reader.selection.anchorNode;
      this.makeLeafSpeakable();
      this.speak();
    } else {
      this.next();
    }
  };

  resume = () => {
    this.$.innerHTML = `<button>${pauseIcon}</button>`;
    this.next();
  };

  findLeaf() {
    while (this.leaf.firstChild) {
      this.leaf = this.leaf.firstChild;
    }
  }

  findNextLeaf() {
    if (this.reader.chapter.isSameNode(this.leaf)) {
      this.findLeaf();
    } else if (this.leaf.nextSibling) {
      this.leaf = this.leaf.nextSibling;
      this.findLeaf();
    } else {
      this.leaf = this.leaf.parentNode;
      if (this.reader.chapter.isSameNode(this.leaf)) {
        return;
      }
      this.findNextLeaf();
    }
  }

  readable() {
    return (
      this.leaf.nodeName === '#text' && /[^\s\n,.?!;":“”]/.test(this.leaf.data)
    );
  }

  findNextTextNode() {
    if (this.leaf && this.TTSWrapper) {
      this.TTSWrapper.replaceWith(this.leaf);
      this.TTSWrapper = null;
    }
    do {
      this.findNextLeaf();
    } while (!this.readable() && !this.reader.chapter.isSameNode(this.leaf));
    if (this.reader.chapter.isSameNode(this.leaf)) {
      return;
    }
    this.makeLeafSpeakable();
  }

  makeLeafSpeakable() {
    this.TTSWrapper = document.createElement('tts-wrapper');
    this.TTSWrapper.innerHTML = this.leaf.data.replace(
      /([^\n,.?!;":“”]+)/g,
      matched => {
        if (matched.trim().length) {
          return `<tts>${matched}</tts>`;
        }
        return matched;
      },
    );
    this.TTSEle = this.TTSWrapper.firstElementChild;
    this.leaf.replaceWith(this.TTSWrapper);
  }

  next = () => {
    try {
      if (this.TTSEle) {
        this.TTSEle.classList.remove('highlight');
      }
      if (this.reading) {
        if (this.TTSEle && this.TTSEle.nextElementSibling) {
          this.TTSEle = this.TTSEle.nextElementSibling;
        } else {
          this.findNextTextNode();
        }
      } else {
        if (!this.TTSEle) {
          this.findNextTextNode();
        }
      }
      this.speak();
    } catch (e) {
      alert(e);
    }
  };

  stop = () => {
    this.$.classList.add('d-none');
    this.reading = false;
    if (this.leaf && this.TTSWrapper) {
      this.TTSWrapper.replaceWith(this.leaf);
      this.TTSWrapper = null;
      this.TTSEle = null;
      this.leaf = this.reader.chapter;
    }
    this.reader.post({ type: 'stop-speak' });
  };

  pause = () => {
    this.$.innerHTML = `<button>${resumeIcon}</button>`;
    this.reading = false;
    this.reader.post({ type: 'stop-speak' });
  };

  started = () => this.TTSWrapper !== null;

  speak = () => {
    this.reading = true;
    if (this.reader.chapter.isSameNode(this.leaf)) {
      return;
    }
    this.TTSEle.classList.add('highlight');
    this.reader.post({ type: 'speak', data: this.TTSEle?.innerText.trim() });
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
          tts.start();
          this.closeMenu();
        },
      }),
      START_HERE: this.renderItem({
        name: 'Start Here',
        icon: selectVolumeIcon,
        action: () => {
          tts.startHere();
          this.closeMenu();
        },
      }),
      COPY: this.renderItem({
        name: 'Copy',
        icon: copyIcon,
        action: () => {
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
      this.isOpened = true;
      if (this.reader.selection.type === 'Range') {
        this.renderMenu([this.items.START_HERE, this.items.START_READING]);
      } else {
        this.renderMenu([this.items.START_READING]);
      }
      const { clientX, clientY } = e;
      document.body.appendChild(this.contextMenu);
      const positionY =
        clientY + this.contextMenu.scrollHeight >= window.innerHeight
          ? window.innerHeight - this.contextMenu.scrollHeight - 20
          : clientY;
      const positionX =
        clientX + this.contextMenu.scrollWidth >= window.innerWidth
          ? window.innerWidth - this.contextMenu.scrollWidth - 20
          : clientX;
      this.contextMenu.setAttribute(
        'style',
        `--width: ${this.contextMenu.scrollWidth}px;
        --height: ${this.contextMenu.scrollHeight}px;
        --top: ${positionY}px;
        --left: ${positionX}px;`,
      );
    });
  }
}

try {
  var swipeHandler = new SwipeHandler();
  var toolWrapper = new ToolWrapper();
  var reader = new Reader();
  var scrollHandler = new ScrollHandler(reader, toolWrapper);
  var tts = new TextToSpeech(reader);
  toolWrapper.tools = [scrollHandler, tts];
  const contextMenu = new ContextMenu(reader);
  contextMenu.init();
} catch (e) {
  alert(e);
}
