export const horizontalReaderPages = (padding: number) => `
const chapter = document.querySelector("chapter");
const clientWidth = document.documentElement.clientWidth;
const textWidth = chapter.scrollWidth;
const navLeft = document.getElementById("left");
const navRight = document.getElementById("right");
const infoBox = document.getElementById("infoContainer");
infoBox.classList.add("hidden");

const pages = Math.round(textWidth / clientWidth);
let page = 0;

navRight.addEventListener("click", () => {
  if (page < pages ) {
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
  chapter.style.transform = 'translate(calc('
  + page * -100
  + '% + '
  + -${padding} * 2 * page
  +'%))';
  window.ReactNativeWebView.postMessage(
    JSON.stringify(
      {
        type:"scrollend",
        data:{
            offSetY: window.pageXOffset,                                    percentage: page === 0 ? 1 :(page * document.documentElement.clientWidth) / document.querySelector("chapter").scrollWidth*100,  
        }
      }
    )
  );
}
;`;
