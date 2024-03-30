function setup(progress, customJS) {
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
  document
    .querySelector('.chapterCtn')
    .addEventListener(
      'click',
      !reader.pageReader ? () => reader.post({ type: 'hide' }) : tapChapter,
    );

  document.addEventListener('DOMContentLoaded', startup);
}
