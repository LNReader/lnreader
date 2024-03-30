const select = key => {
  return document.querySelector(key);
};
const chapter = select('chapter');
const getInt = key => {
  return parseInt(chapter?.getAttribute('data-' + key));
};
const setAttr = (key, val) => {
  chapter?.setAttribute(key, val);
};
