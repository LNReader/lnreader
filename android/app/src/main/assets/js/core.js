/* eslint-disable no-console */
window.reader = new (function () {
  const {
    readerSettings,
    chapterGeneralSettings,
    novel,
    chapter,
    nextChapter,
    prevChapter,
    batteryLevel,
    autoSaveInterval,
    DEBUG,
    strings,
  } = initialReaderConfig;

  // state
  this.hidden = van.state(true);
  this.batteryLevel = van.state(batteryLevel);
  this.readerSettings = van.state(readerSettings);
  this.generalSettings = van.state(chapterGeneralSettings);

  this.chapterElement = document.querySelector('#LNReader-chapter');
  this.selection = window.getSelection();
  this.viewport = document.querySelector('meta[name=viewport]');

  this.novel = novel;
  this.chapter = chapter;
  this.nextChapter = nextChapter;
  this.prevChapter = prevChapter;
  this.strings = strings;
  this.autoSaveInterval = autoSaveInterval;
  this.rawHTML = this.chapterElement.innerHTML;

  //layout props
  this.paddingTop = parseInt(
    getComputedStyle(document.querySelector('body')).getPropertyValue(
      'padding-top',
    ),
    10,
  );
  this.chapterHeight = this.chapterElement.scrollHeight + this.paddingTop;
  this.layoutHeight = window.screen.height;
  this.layoutWidth = window.screen.width;

  this.layoutEvent = undefined;
  this.chapterEndingVisible = van.state(false);

  this.post = obj => window.ReactNativeWebView.postMessage(JSON.stringify(obj));
  this.refresh = () => {
    if (this.generalSettings.val.pageReader) {
      this.chapterWidth = this.chapterElement.scrollWidth;
    } else {
      this.chapterHeight = this.chapterElement.scrollHeight + this.paddingTop;
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
      settings.padding + 'px',
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

  document.onscrollend = () => {
    if (!this.generalSettings.val.pageReader) {
      this.post({
        type: 'save',
        data: parseInt(
          ((window.scrollY + this.layoutHeight) / this.chapterHeight) * 100,
          10,
        ),
      });
    }
  };

  if (DEBUG) {
    // eslint-disable-next-line no-global-assign, no-new-object
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
  Object.assign(this, {
    readableNodeNames: ['#text', 'B', 'I', 'SPAN', 'EM', 'BR', 'STRONG', 'A'],
    prevElement: null,
    currentElement: reader.chapterElement,
    started: false,
    reading: false,
    queueBuffer: [],
    currentQueueIndex: 0,
    queueSize: 3,
    isQueueing: false,
    isPaused: false,
  });

  this.readable = element => {
    const ele = element ?? this.currentElement;
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
    if (this.currentElement.isSameNode(reader.chapterElement) && this.started)
      return false;
    this.started = true;

    if (this.currentElement.isSameNode(this.prevElement)) {
      this.prevElement = this.currentElement;
      this.currentElement =
        this.currentElement.nextElementSibling ||
        this.currentElement.parentElement;
      return this.findNextTextNode();
    }
    // can read? read it
    if (this.readable()) return true;

    this.prevElement = this.currentElement;
    this.currentElement =
      (!this.prevElement?.parentElement?.isSameNode(this.currentElement) &&
        this.currentElement.firstElementChild) ||
      this.currentElement.nextElementSibling ||
      this.currentElement.parentElement;
    return this.findNextTextNode();
  };

  // Handle (possibly) problematic characters
  this.sanitizeTextForTTS = text => {
    if (!text) return '';

    return text
      .replace(/</g, '(')
      .replace(/>/g, ')')
      .replace(/\s+/g, ' ')
      .trim();
  };

  this.collectParagraphs = (startElement, count) => {
    const [originalCurrent, originalPrev, originalStarted] = [
      this.currentElement,
      this.prevElement,
      this.started,
    ];
    [this.currentElement, this.prevElement, this.started] = [
      startElement,
      this.prevElement,
      this.started,
    ];

    const paragraphs = [];
    for (let i = 0; i < count && this.findNextTextNode(); i++) {
      const rawText = this.currentElement?.innerText?.trim();
      if (rawText?.length) {
        const sanitizedText = this.sanitizeTextForTTS(rawText);
        if (sanitizedText.length) {
          paragraphs.push({
            element: this.currentElement,
            text: sanitizedText,
          });
        }
      }
      this.prevElement = this.currentElement;
    }

    [this.currentElement, this.prevElement, this.started] = [
      originalCurrent,
      originalPrev,
      originalStarted,
    ];
    return paragraphs;
  };

  this.updateTTSIcon = () => {
    const controller =
      document.getElementById('TTS-Controller')?.firstElementChild;
    if (controller) controller.innerHTML = volumnIcon;
  };

  this.queueParagraphs = () => {
    if (this.isQueueing) return;
    this.isQueueing = true;

    try {
      const paragraphs = this.collectParagraphs(
        this.currentElement,
        this.queueSize,
      );
      if (!paragraphs.length) {
        this.reading = false;
        this.stop();
        this.updateTTSIcon();
        return;
      }

      this.queueBuffer = paragraphs;
      this.currentQueueIndex = 0;

      // Highlight and speak first paragraph
      this.currentElement?.classList?.remove('highlight');
      this.currentElement = paragraphs[0].element;
      this.currentElement.classList.add('highlight');
      this.prevElement = this.currentElement;

      // Queue paragraphs into expo-speech
      paragraphs.forEach(p => reader.post({ type: 'speak', data: p.text }));
    } catch (e) {
      console.error('Error queuing paragraphs:', e);
    } finally {
      this.isQueueing = false;
    }
  };

  this.next = () => {
    try {
      this.currentElement?.classList?.remove('highlight');

      if (this.queueBuffer.length > 0) {
        this.currentQueueIndex++;

        if (this.currentQueueIndex < this.queueBuffer.length) {
          const nextParagraph = this.queueBuffer[this.currentQueueIndex];
          this.currentElement = nextParagraph.element;
          this.currentElement.classList.add('highlight');
          this.prevElement = this.currentElement;

          // Queue more paragraphs when near end
          if (this.currentQueueIndex >= this.queueBuffer.length - 1) {
            const [tempCurrent, tempPrev] = [
              this.currentElement,
              this.prevElement,
            ];
            const lastElement =
              this.queueBuffer[this.queueBuffer.length - 1].element;
            [this.currentElement, this.prevElement] = [
              lastElement,
              lastElement,
            ];

            setTimeout(() => {
              const moreParagraphs = this.collectParagraphs(
                this.currentElement,
                this.queueSize,
              );
              this.queueBuffer.push(...moreParagraphs);
              moreParagraphs.forEach(p =>
                reader.post({ type: 'speak', data: p.text }),
              );
              [this.currentElement, this.prevElement] = [tempCurrent, tempPrev];
            }, 100);
          }
        } else {
          // Queue over
          if (this.queueBuffer.length > 0) {
            const lastElement =
              this.queueBuffer[this.queueBuffer.length - 1].element;
            [this.currentElement, this.prevElement] = [
              lastElement,
              lastElement,
            ];
          }

          if (this.findNextTextNode()) {
            this.queueParagraphs();
          } else {
            this.reading = false;
            this.stop();
            this.updateTTSIcon();
          }
        }
      } else {
        // Fallback behavior
        if (this.findNextTextNode()) {
          this.reading = true;
          this.speak();
        } else {
          this.reading = false;
          this.stop();
          this.updateTTSIcon();
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  this.start = element => {
    this.stop();
    Object.assign(this, {
      currentElement: element ?? reader.chapterElement,
      queueBuffer: [],
      currentQueueIndex: 0,
      reading: true,
    });
    this.queueParagraphs();
  };

  this.resume = () => {
    if (!this.reading) {
      if (this.isPaused && this.currentElement?.id !== 'LNReader-chapter') {
        this.isPaused = false;
        this.reading = true;
        this.currentElement.classList.add('highlight');
        const sanitizedText = this.sanitizeTextForTTS(
          this.currentElement.innerText,
        );
        reader.post({ type: 'speak', data: sanitizedText });

        setTimeout(() => {
          const remainingParagraphs = this.collectParagraphs(
            this.currentElement,
            this.queueSize - 1,
          );
          remainingParagraphs.forEach(p =>
            reader.post({ type: 'speak', data: p.text }),
          );
          this.queueBuffer = [
            { element: this.currentElement, text: sanitizedText },
            ...remainingParagraphs,
          ];
          this.currentQueueIndex = 0;
        }, 100);
      } else {
        this.start();
      }
    }
  };

  this.pause = () => {
    this.reading = false;
    this.isPaused = true;
    reader.post({ type: 'stop-speak' });
  };

  this.stop = () => {
    reader.post({ type: 'stop-speak' });
    this.currentElement?.classList?.remove('highlight');
    Object.assign(this, {
      prevElement: null,
      currentElement: reader.chapterElement,
      started: false,
      reading: false,
      isPaused: false,
      queueBuffer: [],
      currentQueueIndex: 0,
      isQueueing: false,
    });
  };

  this.speak = () => {
    this.prevElement = this.currentElement;
    this.currentElement.classList.add('highlight');
    const sanitizedText = this.sanitizeTextForTTS(
      this.currentElement?.innerText,
    );
    reader.post({ type: 'speak', data: sanitizedText });
  };
})();

window.pageReader = new (function () {
  this.page = van.state(0);
  this.totalPages = van.state(0);
  this.chapterEndingVisible = van.state(
    initialPageReaderConfig.nextChapterScreenVisible,
  );
  this.chapterEnding = document.getElementsByClassName('transition-chapter')[0];

  this.showChapterEnding = (bool, instant, left) => {
    if (!this.chapterEnding) {
      this.chapterEnding =
        document.getElementsByClassName('transition-chapter')[0];
      if (!this.chapterEnding) return;
    }
    this.chapterEnding.style.transition = 'unset';
    if (bool) {
      this.chapterEnding.style.transform = `translateX(${left ? -200 : 0}vw)`;
      requestAnimationFrame(() => {
        if (!instant) this.chapterEnding.style.transition = '200ms';
        this.chapterEnding.style.transform = 'translateX(-100vw)';
      });
      this.chapterEndingVisible.val = true;
    } else {
      if (!instant) this.chapterEnding.style.transition = '200ms';
      this.chapterEnding.style.transform = `translateX(${left ? -200 : 0}vw)`;
      this.chapterEndingVisible.val = false;
    }
  };

  this.movePage = destPage => {
    if (this.chapterEndingVisible.val) {
      if (destPage < 0) {
        this.showChapterEnding(false);
        return;
      }
      if (destPage < this.totalPages.val) {
        this.showChapterEnding(false, false, true);
        return;
      }
      if (destPage >= this.totalPages.val) {
        return reader.post({ type: 'next' });
      }
    }
    destPage = parseInt(destPage, 10);
    if (destPage < 0) {
      document.getElementsByClassName('transition-chapter')[0].innerText =
        reader.prevChapter.name;
      this.showChapterEnding(true, false, true);
      setTimeout(() => {
        reader.post({ type: 'prev' });
      }, 200);
      return;
    }
    if (destPage >= this.totalPages.val) {
      document.getElementsByClassName('transition-chapter')[0].innerText =
        reader.nextChapter.name;
      this.showChapterEnding(true);
      setTimeout(() => {
        reader.post({ type: 'next' });
      }, 200);
      return;
    }
    this.page.val = destPage;
    reader.chapterElement.style.transform =
      'translateX(-' + destPage * 100 + '%)';

    const newProgress = parseInt(
      ((pageReader.page.val + 1) / pageReader.totalPages.val) * 100,
      10,
    );

    if (newProgress > reader.chapter.progress) {
      reader.post({
        type: 'save',
        data: parseInt(
          ((pageReader.page.val + 1) / pageReader.totalPages.val) * 100,
          10,
        ),
      });
    }
  };

  van.derive(() => {
    // ignore if initial or other states change
    if (
      reader.generalSettings.val.pageReader ===
      reader.generalSettings.oldVal.pageReader
    ) {
      return;
    }
    if (reader.generalSettings.val.pageReader) {
      const ratio = Math.min(
        0.99,
        (window.scrollY + reader.layoutHeight) / reader.chapterHeight,
      );
      document.body.classList.add('page-reader');
      setTimeout(() => {
        reader.refresh();
        this.totalPages.val = parseInt(
          (reader.chapterWidth + reader.readerSettings.val.padding * 2) /
            reader.layoutWidth,
          10,
        );
        this.movePage(this.totalPages.val * ratio);
      }, 100);
    } else {
      reader.chapterElement.style = '';
      document.body.classList.remove('page-reader');
      setTimeout(() => {
        reader.refresh();
        window.scrollTo({
          top:
            (reader.chapterHeight * (this.page.val + 1)) / this.totalPages.val -
            reader.layoutHeight,
          behavior: 'smooth',
        });
      }, 100);
    }
  });
})();

document.addEventListener('DOMContentLoaded', () => {
  if (pageReader.chapterEndingVisible.val) {
    pageReader.showChapterEnding(true, true);
  }
});

function calculatePages() {
  reader.refresh();

  if (reader.generalSettings.val.pageReader) {
    pageReader.totalPages.val = parseInt(
      (reader.chapterWidth + reader.readerSettings.val.padding * 2) /
        reader.layoutWidth,
      10,
    );

    if (initialPageReaderConfig.nextChapterScreenVisible) return;

    pageReader.movePage(
      Math.max(
        0,
        Math.round(
          (pageReader.totalPages.val * reader.chapter.progress) / 100,
        ) - 1,
      ),
    );
  } else {
    window.scrollTo({
      top:
        (reader.chapterHeight * reader.chapter.progress) / 100 -
        reader.layoutHeight,
      behavior: 'smooth',
    });
  }
}

const ro = new ResizeObserver(() => {
  if (pageReader.totalPages.val) {
    calculatePages();
  }
});
ro.observe(reader.chapterElement);

// Also call once on load
window.addEventListener('load', () => {
  document.fonts.ready.then(() => {
    requestAnimationFrame(() => setTimeout(calculatePages, 0));
  });
});

// click handler
(function () {
  const detectTapPosition = (x, y, horizontal) => {
    if (horizontal) {
      if (x < 0.33) {
        return 'left';
      }
      if (x > 0.66) {
        return 'right';
      }
    } else {
      if (y < 0.33) {
        return 'top';
      }
      if (y > 0.66) {
        return 'bottom';
      }
    }
    return 'center';
  };
  document.onclick = e => {
    const { clientX, clientY } = e;
    const { x, y } = {
      x: clientX / reader.layoutWidth,
      y: clientY / reader.layoutHeight,
    };

    if (reader.generalSettings.val.pageReader) {
      const position = detectTapPosition(x, y, true);
      if (position === 'left') {
        pageReader.movePage(pageReader.page.val - 1);
        return;
      }
      if (position === 'right') {
        pageReader.movePage(pageReader.page.val + 1);
        return;
      }
    } else {
      if (reader.generalSettings.val.tapToScroll) {
        const position = detectTapPosition(x, y, false);
        if (position === 'top') {
          window.scrollBy({
            top: -reader.layoutHeight * 0.75,
            behavior: 'smooth',
          });
          return;
        }
        if (position === 'bottom') {
          window.scrollBy({
            top: reader.layoutHeight * 0.75,
            behavior: 'smooth',
          });
          return;
        }
      }
    }
    reader.post({ type: 'hide' });
  };
})();

// swipe handler
(function () {
  this.initialX = null;
  this.initialY = null;

  reader.chapterElement.addEventListener('touchstart', e => {
    this.initialX = e.changedTouches[0].screenX;
    this.initialY = e.changedTouches[0].screenY;
  });

  reader.chapterElement.addEventListener('touchmove', e => {
    if (reader.generalSettings.val.pageReader) {
      const diffX =
        (e.changedTouches[0].screenX - this.initialX) / reader.layoutWidth;
      reader.chapterElement.style.transition = 'unset';
      reader.chapterElement.style.transform =
        'translateX(-' + (pageReader.page.val - diffX) * 100 + '%)';
    }
  });

  reader.chapterElement.addEventListener('touchend', e => {
    const diffX = e.changedTouches[0].screenX - this.initialX;
    const diffY = e.changedTouches[0].screenY - this.initialY;
    if (reader.generalSettings.val.pageReader) {
      reader.chapterElement.style.transition = '200ms';
      const diffXPercentage = diffX / reader.layoutWidth;
      if (diffXPercentage < -0.3) {
        pageReader.movePage(pageReader.page.val + 1);
      } else if (diffXPercentage > 0.3) {
        pageReader.movePage(pageReader.page.val - 1);
      } else {
        pageReader.movePage(pageReader.page.val);
      }
      return;
    }
    if (
      e.target.id?.startsWith('scrollbar') ||
      e.target.id === 'Image-Modal-img'
    ) {
      return;
    }
    if (
      reader.generalSettings.val.swipeGestures &&
      Math.abs(diffX) > Math.abs(diffY) * 2 &&
      Math.abs(diffX) > 180
    ) {
      if (diffX < 0 && this.initialX >= window.innerWidth / 2) {
        e.preventDefault();
        reader.post({ type: 'next' });
      } else if (diffX > 0 && this.initialX <= window.innerWidth / 2) {
        e.preventDefault();
        reader.post({ type: 'prev' });
      }
    }
  });
})();

// text options
(function () {
  van.derive(() => {
    let html = reader.rawHTML;
    if (reader.generalSettings.val.bionicReading) {
      html = textVide.textVide(reader.rawHTML);
    }

    if (reader.generalSettings.val.removeExtraParagraphSpacing) {
      html = html
        .replace(/(?:&nbsp;\s*|[\u200b]\s*)+(?=<\/?p[> ])/g, '')
        .replace(/<br>\s*<br>\s*(?:<br>\s*)+/g, '<br><br>') //force max 2 consecutive <br>, chaining regex
        .replace(
          /<br>\s*<br>(?:(?!\s*<(?:em|[iab]|strong|span)[> ])|(?<!(?:\/em|\/[iab]|\/strong|\/span)>\s*<br>\s*<br>))\s*/g,
          '',
        ) //look-around double br. If certain tags aren't near, delete the double br.
        .replace(/<br>(?:(?=\s*<\/?p[> ])|(?<=<\/?p>\s*<br>))\s*/g, '');
    }
    reader.chapterElement.innerHTML = html;
  });
})();
