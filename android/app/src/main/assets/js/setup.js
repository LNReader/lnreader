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
        setPages();
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
