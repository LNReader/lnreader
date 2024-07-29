window.reader = new (function () {
  const {
    readerSettings,
    chapterGeneralSettings,
    novel,
    chapter,
    batteryLevel,
    autoSaveInterval,
    DEBUG,
  } = initialReaderConfig;

  // state
  this.hidden = van.state(true);
  this.batteryLevel = van.state(batteryLevel);
  this.readerSettings = van.state(readerSettings);
  this.generalSettings = van.state(chapterGeneralSettings);

  this.chapterElement = document.querySelector('chapter');
  this.selection = window.getSelection();
  this.viewport = document.querySelector('meta[name=viewport]');

  this.novel = novel;
  this.chapter = chapter;
  this.autoSaveInterval = autoSaveInterval;
  this.rawHTML = this.chapterElement.innerHTML;

  //layout props
  this.paddingTop = parseInt(
    getComputedStyle(document.querySelector('html')).getPropertyValue(
      'padding-top',
    ),
    10,
  );
  this.chapterHeight = this.chapterElement.scrollHeight + this.paddingTop;
  this.layoutHeight = window.innerHeight;
  this.layoutWidth = window.innerWidth;

  this.post = obj => window.ReactNativeWebView.postMessage(JSON.stringify(obj));
  this.refresh = () => {
    if (!this.generalSettings.val.pageReader) {
      this.chapterHeight = this.chapterElement.scrollHeight + this.paddingTop;
    } else {
      this.chapterWidth = this.chapterElement.scrollWidth;
    }
  };

  van.derive(() => {
    const settings = this.readerSettings.val;
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
  });

  setInterval(() => {
    if (!this.generalSettings.val.pageReader) {
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
  }, this.autoSaveInterval);

  if (DEBUG) {
    console = new Object();
    console.log = function (...data) {
      reader.post({ 'type': 'console', 'msg': data?.join(' ') });
    };
    console.debug = console.log;
    console.info = console.log;
    console.warn = console.log;
    console.error = console.log;
  }
  // end reader
})();

window.tts = new (function () {
  this.readableNodeNames = [
    '#text',
    'B',
    'I',
    'SPAN',
    'EM',
    'BR',
    'STRONG',
    'A',
  ];
  this.prevElement = null;
  this.currentElement = reader.chapterElement;
  this.started = false;
  this.reading = false;

  this.readable = element => {
    ele = element ?? this.currentElement;
    if (
      ele.nodeName !== 'SPAN' &&
      this.readableNodeNames.includes(ele.nodeName)
    ) {
      return false;
    }
    if (!ele.hasChildNodes()) {
      return false;
    }
    for (let i = 0; i < ele.childNodes.length; i++) {
      if (!this.readableNodeNames.includes(ele.childNodes.item(i).nodeName)) {
        return false;
      }
    }
    return true;
  };

  // if can find a readable node, else stop tts
  this.findNextTextNode = () => {
    if (!this.started) {
      this.started = true;
      if (this.readable()) {
        return true;
      }
    } else if (this.currentElement.isSameNode(reader.chapterElement)) {
      return false;
    }
    // node is read -> next node or parent node
    if (this.currentElement.isSameNode(this.prevElement)) {
      this.prevElement = this.currentElement;
      if (this.currentElement.nextElementSibling) {
        this.currentElement = this.currentElement.nextElementSibling;
      } else {
        this.currentElement = this.currentElement.parentElement;
      }
      return this.findNextTextNode();
    }

    if (this.readable()) {
      return true;
    }
    if (this.prevElement?.parentElement.isSameNode(this.currentElement)) {
      // is backtracking
      this.prevElement = this.currentElement;
      if (this.currentElement.nextElementSibling) {
        this.currentElement = this.currentElement.nextElementSibling;
      } else {
        this.currentElement = this.currentElement.parentElement;
      }
      return this.findNextTextNode();
    }
    if (this.currentElement.firstElementChild) {
      // go deeper
      this.prevElement = this.currentElement;
      this.currentElement = this.currentElement.firstElementChild;
      return this.findNextTextNode();
    }
    return false;
  };

  this.next = () => {
    try {
      this.currentElement?.classList?.remove('highlight');
      if (this.findNextTextNode()) {
        this.reading = true;
        this.speak();
      } else {
        this.reading = false;
      }
    } catch (e) {
      alert(e);
    }
  };

  this.start = element => {
    this.stop();
    this.currentElement = element ?? reader.chapterElement;
    this.next();
  };

  this.resume = () => {
    if (!this.reading) {
      this.next();
    }
  };

  this.stop = () => {
    reader.post({ type: 'stop-speak' });
    this.currentElement?.classList?.remove('highlight');
    this.prevElement = null;
    this.currentElement = reader.chapterElement;
    this.started = false;
    this.reading = false;
  };

  this.pause = () => {
    this.reading = false;
    reader.post({ type: 'stop-speak' });
  };

  this.speak = () => {
    this.prevElement = this.currentElement;
    this.currentElement.classList.add('highlight');
    reader.post({ type: 'speak', data: this.currentElement?.innerText });
  };
})();

// click handler
document.onclick = e => {
  if (reader.generalSettings.val.pageReader) {
    tapChapter(e);
  } else {
    reader.post({ type: 'hide' });
  }
};

// swipe handler
(function () {
  this.initialX = null;
  this.initialY = null;

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

  van.derive(() => {
    if (reader.generalSettings.val.swipeGestures) {
      document.addEventListener('touchstart', this.touchStartHandler);
      document.addEventListener('touchend', this.touchEndHandler);
    } else {
      document.removeEventListener('touchstart', this.touchStartHandler);
      document.removeEventListener('touchend', this.touchEndHandler);
    }
  });
})();
