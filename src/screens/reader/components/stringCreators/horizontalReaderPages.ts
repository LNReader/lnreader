export const createHorizontalReaderPages = () => `
const chapter = document.querySelector("chapter");
const clientWidth = document.documentElement.clientWidth;
const textWidth = chapter.scrollWidth;
const navLeft = document.getElementById("left");
const navRight = document.getElementById("right");
const infoBox = document.getElementById("infoContainer");
infoBox.classList.add("hidden");
document.getElementById("spacer").style.height = infoBox.scrollHeight + 'px';

const pages = Math.ceil(textWidth / clientWidth) - 1;
let page = 0;

navRight.addEventListener("click", () => {
  if (page < pages  ) {
    page++;
    movePage();
    if (page === pages){
      infoBox.classList.add("show")
    }
  }
});
navLeft.addEventListener("click", () => {
  if (page > 0) {
    infoBox.classList.remove("show")
    page--;
    movePage();
  }
})
function movePage(){
  chapter.style.transform = 'translate(-'+page*100+'%)';

  window.ReactNativeWebView.postMessage(
    JSON.stringify(
      {
        type:"scrollend",
        data:{
            offSetY: window.pageXOffset,                                    percentage: page === 0 ? 1 :page  /pages *100,  
        }
      }
    )
  );
}
;`;
