const {
  readerSettings,
  chapterGeneralSettings,
  novel,
  chapter,
  batteryLevel,
  autoSaveInterval,
  DEBUG,
} = initialReaderConfig;

window.reader = new (function () {
  this.chapterElement = document.querySelector('chapter');
  this.selection = window.getSelection();
  this.novel = novel;
  this.chapter = chapter;
  this.chapterGeneralSettings = chapterGeneralSettings;
  this.chapterReaderSettings = readerSettings;
  this.autoSaveInterval = autoSaveInterval;
  this.rawHTML = this.chapterElement.innerHTML;

  //layout props
  this.viewport = document.querySelector('meta[name=viewport]');
  this.paddingTop = parseInt(
    getComputedStyle(document.querySelector('html')).getPropertyValue(
      'padding-top',
    ),
    10,
  );
  this.chapterHeight = this.chapterElement.scrollHeight + this.paddingTop;
  this.layoutHeight = window.innerHeight;
  this.layoutWidth = window.innerWidth;

  this.updateCallbacks = {
    generalSettings: [],
    batteryLevel: [],
  };
  this.post = obj => window.ReactNativeWebView.postMessage(JSON.stringify(obj));
  this.subscribe = (name, callback) =>
    this.updateCallbacks[name].push(callback);
  this.updateGeneralSettings = settings => {
    for (const callback of this.updateCallbacks.generalSettings) {
      callback(settings);
    }
  };
  this.updateReaderSettings = settings => {
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
  this.updateBatteryLevel = level => {
    for (const callback of this.updateCallbacks.batteryLevel) {
      callback(level);
    }
  };

  this.refresh = () => {
    if (!this.pageReader) {
      this.chapterHeight = this.chapter.scrollHeight + this.paddingTop;
    } else {
      this.percentage.innerText = getPage() + 1 + '/' + (getPages() + 1);
      this.chapterWidth = this.chapter.scrollWidth;
    }
  };

  // init actions

  document.onclick = e => {
    if (this.chapterGeneralSettings.pageReader) {
      tapChapter(e);
    } else {
      this.post({ type: 'hide' });
    }
  };

  setInterval(() => {
    if (!this.chapterGeneralSettings.pageReader) {
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

  // end reader
})();

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
