/**
 * UI components register events for updating from app via reader.
 * UI components send events back via reader.post.
 */
const { div, p } = van.tags;

const App = () => {
  return div(p('Hello'));
};

van.add(document.getElementById('reader-ui'), App());
