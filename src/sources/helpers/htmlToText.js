export const htmlToText = (text) => {
    const parsedText = text
        .replace(/&#x((\d|\w){4}|(\d|\w){2});/g, "")
        .replace(/&apos;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<[^>]+>/g, "\n")
        .replace(/(\n)+/g, "\n\n");

    return parsedText;
};
