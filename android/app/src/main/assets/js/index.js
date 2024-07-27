/**
 * UI components register events for updating from app via reader.
 * UI components send events back via reader.post.
 */
const { div, p } = van.tags;

const Scrollbar = ({ horizontal }) => {
  let lock = false;
  const percentage = van.state(0);
  const update = ratio => {
    if (ratio === undefined) {
      ratio = (window.scrollY + reader.layoutHeight) / reader.chapterHeight;
    }
    if (ratio > 1) {
      ratio = 1;
    }
    percentage.val = parseInt(ratio * 100);
    if (lock) {
      window.scrollTo({
        top: reader.chapterHeight * ratio - reader.layoutHeight,
        behavior: 'instant',
      });
    }
  };
  window.onscroll = () => !lock && update();

  return div(
    { id: 'ScrollBar' },
    div(
      { class: 'scrollbar-item scrollbar-text', id: 'scrollbar-percentage' },
      percentage,
    ),
    div(
      { class: 'scrollbar-item', id: 'scrollbar-slider' },
      div(
        { id: 'scrollbar-track' },
        div(
          {
            id: 'scrollbar-progress',
            style: () =>
              horizontal.val
                ? `width: ${percentage.val}%; height: 100%;`
                : `height: ${percentage.val}%; width: 100%;`,
          },
          div(
            {
              id: 'scrollbar-thumb-wrapper',
              ontouchstart: () => {
                lock = true;
              },
              ontouchend: () => {
                lock = false;
              },
              ontouchmove: function (e) {
                const slider = this.parentElement.parentElement.parentElement;
                const sliderHeight = horizontal.val
                  ? slider.clientWidth
                  : slider.clientHeight;
                const sliderOffsetY = horizontal.val
                  ? slider.getBoundingClientRect().left
                  : slider.getBoundingClientRect().top;
                const ratio =
                  ((horizontal.val
                    ? e.changedTouches[0].clientX
                    : e.changedTouches[0].clientY) -
                    sliderOffsetY) /
                  sliderHeight;
                update(ratio < 0 ? 0 : ratio);
              },
            },
            div({ id: 'scrollbar-thumb' }),
          ),
        ),
      ),
    ),
    div(
      {
        class: 'scrollbar-item scrollbar-text',
        id: 'scrollbar-percentage-max',
      },
      100,
    ),
  );
};

const ToolWrapper = () => {
  const horizontal = van.state(!reader.chapterGeneralSettings.verticalSeekbar);
  const isHidden = van.state(true);
  reader.subscribe('hidden', hidden => (isHidden.val = hidden));
  reader.subscribe(
    'generalSettings',
    settings => (horizontal.val = !settings.verticalSeekbar),
  );
  return div(
    {
      id: 'ToolWrapper',
      class: () =>
        `${isHidden.val ? 'hidden' : ''} ${horizontal.val ? 'horizontal' : ''}`,
    },
    Scrollbar({ horizontal: horizontal }),
  );
};

const ReaderUI = () => {
  return div(ToolWrapper());
};

van.add(document.getElementById('reader-ui'), ReaderUI());
