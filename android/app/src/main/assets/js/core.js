        e.preventDefault();
        reader.post({ type: 'next' });
      } else if (diffX > 0 && this.initialX <= window.innerWidth / 2) {
        e.preventDefault();
        reader.post({ type: 'prev' });
      }
    }
  });
})();

// text options
(function () {
  van.derive(() => {
    let html = reader.rawHTML;
    if (reader.generalSettings.val.bionicReading) {
      html = textVide.textVide(reader.rawHTML);
    }

    if (reader.generalSettings.val.removeExtraParagraphSpacing) {
      html = html
        .replace(/(?:&nbsp;\s*|[\u200b]\s*)+(?=<\/?p[> ])/g, '')
        .replace(/<br>\s*<br>\s*(?:<br>\s*)+/g, '<br><br>') //force max 2 consecutive <br>, chaining regex
        .replace(/^[^]+$/g, _ =>
          /\/p>/.test(_) ? _ : _.replace(/<br>\s*<br>\s*/g, ''),
        ) //if <p> exist in the html, delete double br
        .replace(/<br>(?:(?=\s*<\/?p[> ])|(?<=<\/?p>\s*<br>))\s*/g, '');
    }
    reader.chapterElement.innerHTML = html;
  });
})();
