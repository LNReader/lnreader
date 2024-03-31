function setup(progress, customJS) {
  document
    .querySelector('.chapterCtn')
    .addEventListener('click', e => onTap(e));

  document.addEventListener('DOMContentLoaded', startup);

  async function startup() {
    customJS;
    //? scroll to saved position
    if (reader.pageReader) {
      setTimeout(() => {
        const textWidth = chapter.scrollWidth;
        const layoutWidth = parseInt(
          document.querySelector('html').getBoundingClientRect().width,
        );
        setAttr('data-pages', Math.round(textWidth / layoutWidth) - 1);
        scrollHandler.onDOMCreation(progress);
      }, 100);
    } else {
      scrollHandler.onDOMCreation(progress);
    }
  }
  function onTap(event) {
    if (!contextMenu.isOpened) {
      !reader.pageReader ? reader.post({ type: 'hide' }) : tapChapter(event);
    } else {
      contextMenu.isOpened = false;
      contextMenu.contextMenu.remove();
    }
  }
}
