export const cleanHtml = (html) => {
    let text = html;

    text = text
        .replace(
            /style="((?:color|font-family|line-height|font-size|text-align).*?)"/gi,
            ""
        )
        .replace(/class=".*?"/gi, "")
        .replace(/id=".*?"/gi, "")
        .replace(/<!--.*?-->/gim, "")
        .replace(/<\s*script[^>]*>[\s\S]*?<\/script>/gim, "")
        .replace(/<\s*noscript[^>]*>[\s\S]*?<\/noscript>/gim, "")
        .replace(/<\s*form[^>]*>[\s\S]*?<\/form>/gim, "")
        .trim();

    return text;
};
