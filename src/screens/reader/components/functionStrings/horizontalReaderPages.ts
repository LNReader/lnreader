export const horizontalReaderPages = `
const mainElement = document.querySelector("chapter");
const navLeft = document.getElementsByClassName("left")[0];
const navRight = document.getElementsByClassName("right")[0];
const endButton = document.getElementsByClassName("nextButton")[0];
endButton.classList.add("hidden");
const endText = document.getElementsByClassName("infoText")[0];
endText.classList.add("hidden");

const pages = mainElement.innerHTML.split("<p>");
var currentPageEnd = 0;
var currentPageBeginning = -1;
var lastPageParagraphs = 0;

navRight.addEventListener("click", displayNextPage);
navLeft.addEventListener("click", displayPreviousPage);
initialize();

function displayPreviousPage() {
if (currentPageBeginning > 0) {
  if (currentPageEnd === pages.length) {
    endButton.classList.toggle("hidden");
    endText.classList.toggle("hidden");
  }
  let helper = 0;
  var lastPage = mainElement.innerHTML;
  mainElement.innerHTML = "";
  do {
    lastPage = mainElement.innerHTML;
    helper++;
    mainElement.innerHTML =
      "<p>" + pages[currentPageBeginning--] + mainElement.innerHTML;
  } while (
    mainElement.scrollHeight <
      document.documentElement.clientHeight - 70 &&
    currentPageBeginning >= 0
  );
  if (
    !mainElement.scrollHeight <
    document.documentElement.clientHeight - 70
  ) {
    mainElement.innerHTML = lastPage;
    currentPageBeginning++;
    helper--;
  }
  currentPageEnd -= lastPageParagraphs;
  lastPageParagraphs = helper;
}
}
function displayNextPage() {
if (currentPageEnd < pages.length) {
  if (currentPageEnd === -1) {
    currentPageEnd++;
  }

  let helper = 0;
  var lastPage = mainElement.innerHTML;
  mainElement.innerHTML = "";
  do {
    lastPage = mainElement.innerHTML;
    helper++;
    mainElement.innerHTML += "<p>" + pages[currentPageEnd++];
  } while (
    mainElement.scrollHeight <
      document.documentElement.clientHeight - 70 &&
    currentPageEnd <= pages.length
  );
  if (
    !mainElement.scrollHeight <
    document.documentElement.clientHeight - 70
  ) {
    mainElement.innerHTML = lastPage;
    helper--;
    currentPageEnd--;
  }
  currentPageBeginning += lastPageParagraphs;
  lastPageParagraphs = helper;

  if (currentPageEnd === pages.length) {
    endButton.classList.toggle("hidden");
    endText.classList.toggle("hidden");
  }
}
}
function initialize() {
var lastPage = mainElement.innerHTML;
mainElement.innerHTML = "";
do {
  lastPage = mainElement.innerHTML;
  mainElement.innerHTML += "<p>" + pages[currentPageEnd++];
} while (
  mainElement.scrollHeight <
    document.documentElement.clientHeight - 70 &&
  currentPageEnd <= pages.length
);
if (
  !mainElement.scrollHeight <
  document.documentElement.clientHeight - 70
) {
  mainElement.innerHTML = lastPage;
  currentPageEnd--;
}
lastPageParagraphs = currentPageEnd;
}`;
