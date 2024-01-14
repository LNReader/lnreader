export const createHorizontalReaderPages = () => {
  return `
const id = (key) => {
  return document.getElementById(key)
}
const select = (key) => {
  return document.querySelector(key)
}

const chapter = select("chapter");
const clientWidth = document.documentElement.clientWidth;
const textWidth = chapter.scrollWidth;
const navLeft = id("left");
const navRight = id("right");
const infoBox = id("infoContainer");
infoBox.classList.add("hidden");
id("spacer").style.height = infoBox.scrollHeight + 'px';

const pages = (Math.ceil(textWidth / clientWidth) - 1);
let page = 0;


navRight.addEventListener("click", () => {
  page = select("chapter").getAttribute('data-page');
  if (isNaN(page)) {
    page = 0;
  }
  if (page < pages  ) {
    page++;
    movePage();
    if (page === pages){
      infoBox.classList.add("show")
    }
  }
});
navLeft.addEventListener("click", () => {
  page = select("chapter").getAttribute('data-page');
  if (page > 0) {
    infoBox.classList.remove("show")
    page--;
    movePage();
  }
})
function movePage(){
  chapter.style.transform = 'translate(-'+page*100+'%)';
  select('chapter').setAttribute('data-page', 
    page
  );
  window.ReactNativeWebView.postMessage(
    JSON.stringify(
      {
        type:"scrollend",
        data:{
            offSetY: page * 100,                                           percentage: page === 0 ? 1 : page / pages * 100,  
        }
      }
    )
  );
}
let sendWidthTimeout;
const sendPages = (timeOut) => {
  clearTimeout(sendHeightTimeout);
  sendHeightTimeout = setTimeout(
    window.ReactNativeWebView.postMessage(
      JSON.stringify({type:"pages",data: pages})
    ), timeOut
  );
}
sendPages(200);
;`;
};
