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
  window.addEventListener('scroll', () => !lock && update());
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

const Footer = () => {
  const displaySettings = van.state(reader.chapterGeneralSettings);
  const percentage = van.state(0);
  const battery = van.state(reader.initalBatteryLevel);
  const time = van.state(
    new Date().toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  );
  reader.subscribe(
    'generalSettings',
    settings => (displaySettings.val = settings),
  );
  window.addEventListener('scroll', () => {
    let ratio = (window.scrollY + reader.layoutHeight) / reader.chapterHeight;
    if (ratio > 1) {
      ratio = 1;
    }
    percentage.val = parseInt(ratio * 100);
  });
  reader.subscribe('batteryLevel', level => (battery.val = level));
  setInterval(() => {
    time.val = new Date().toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }, 10000);
  return div(
    {
      id: 'reader-footer-wrapper',
      class: () =>
        displaySettings.val.showBatteryAndTime ||
        displaySettings.val.showScrollPercentage
          ? ''
          : 'd-none',
    },
    div(
      { id: 'reader-footer' },

      div(
        {
          id: 'reader-battery',
          class: () =>
            `reader-footer-item ${
              displaySettings.val.showBatteryAndTime ? '' : 'hidden'
            }`,
        },
        () => Math.ceil(battery.val * 100) + '%',
      ),
      div(
        {
          id: 'reader-percentage',
          class: () =>
            `reader-footer-item ${
              displaySettings.val.showScrollPercentage ? '' : 'hidden'
            }`,
        },
        () => percentage.val + '%',
      ),
      div(
        {
          id: 'reader-time',
          class: () =>
            `reader-footer-item ${
              displaySettings.val.showBatteryAndTime ? '' : 'hidden'
            }`,
        },
        time,
      ),
    ),
  );
};

const ReaderUI = () => {
  return div(ToolWrapper(), Footer());
};

van.add(document.getElementById('reader-ui'), ReaderUI());
