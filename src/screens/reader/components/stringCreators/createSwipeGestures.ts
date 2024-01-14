export function createSwipeGestures() {
  return `<script>
    let initialX = null;
    let initialY = null;
    document.addEventListener("touchstart", e => {
      initialX = e.changedTouches[0].screenX;
      initialY = e.changedTouches[0].screenY;
    });
    document.addEventListener("touchend", e => {
      let diffX = e.changedTouches[0].screenX - initialX;
      let diffY = e.changedTouches[0].screenY - initialY;
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
        e.preventDefault();
        window.ReactNativeWebView.postMessage(JSON.stringify({type: diffX<0 ? "next" : "prev"}))
      }
    });
    </script>`;
}
