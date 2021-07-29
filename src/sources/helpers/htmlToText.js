const htmlToText = (html, options = {}) => {
    const { removeLineBreaks = true } = options;

    html = html.trim();

    text = removeLineBreaks && html.replace(/(?:\n|\r\n|\r)/gi, "");

    text = html
        /**
         * <br> -> \n
         */

        .replace(/<\s*br[^>]*>/gi, "\n")

        /**
         * <hr> -> [hr]()
         */

        .replace(/<\s*hr[^>]*>/gi, "")

        /**
         * <li> -> \n
         */
        .replace(/<\s*\/li[^>]*>/gi, "\n")

        /**
         * <p> -> \n\n
         */

        .replace(/<\s*p[^>]*>/gi, "\n\n")

        /**
         * Remove script and noscript tags
         */
        .replace(/<\s*script[^>]*>[\s\S]*?<\/script>/gim, "")
        .replace(/<\s*noscript[^>]*>[\s\S]*?<\/noscript>/gim, "")

        /**
         * Remove style tags
         */

        .replace(/<\s*style[^>]*>[\s\S]*?<\/style>/gim, "")

        /**
         * Remove comments
         */

        .replace(/<!--.*?-->/gim, "")

        /**
         * <a href='link'>Text</a> -> [Text](link)
         */

        .replace(
            /<\s*a[^>]*href=['"](http.*?)['"][^>]*>([\s\S]*?)<\/\s*a\s*>/gi,
            "$2"
        )
        // .replace(
        //     /<\s*a[^>]*href=['"](http.*?)['"][^>]*>([\s\S]*?)<\/\s*a\s*>/gi,
        //     "[$2]($1)"
        // )
        /**
         * <img> -> [img](src)
         */

        // .replace(/<\s*img[^>]*src=['"](.*?)['"][^>]*>/gi, "[img]($1)")

        /**
         * Remove remaining tags
         */

        .replace(/(<([^>]+)>)/gi, "")

        /**
         * Remove tabs.
         */

        .replace(/\t/g, "")

        /**
         * Remove newlines at the beginning of the text.
         */

        .replace(/^\n+/m, "")

        /**
         * Replace multiple spaces with a single space.
         */

        .replace(/ {2,}/g, " ")

        /**
         * Make sure there are never more than two consecutive linebreaks.
         */

        .replace(/\n{2,}/g, "\n\n")

        /**
         * Decode HTML entities.
         */

        .replace(/&([^;]+);/g, decodeHtmlEntity);

    return text;
};

const decodeHtmlEntity = (m, n) => {
    let code;

    if (n.substr(0, 1) == "#") {
        if (n.substr(1, 1) == "x") {
            code = parseInt(n.substr(2), 16);
        } else {
            code = parseInt(n.substr(1), 10);
        }
    } else {
        code = ENTITIES_MAP[n];
    }

    return code === undefined || code === NaN
        ? "&" + n + ";"
        : String.fromCharCode(code);
};

let ENTITIES_MAP = {
    nbsp: 160,
    iexcl: 161,
    cent: 162,
    pound: 163,
    curren: 164,
    yen: 165,
    brvbar: 166,
    sect: 167,
    uml: 168,
    copy: 169,
    ordf: 170,
    laquo: 171,
    not: 172,
    shy: 173,
    reg: 174,
    macr: 175,
    deg: 176,
    plusmn: 177,
    sup2: 178,
    sup3: 179,
    acute: 180,
    micro: 181,
    para: 182,
    middot: 183,
    cedil: 184,
    sup1: 185,
    ordm: 186,
    raquo: 187,
    frac14: 188,
    frac12: 189,
    frac34: 190,
    iquest: 191,
    Agrave: 192,
    Aacute: 193,
    Acirc: 194,
    Atilde: 195,
    Auml: 196,
    Aring: 197,
    AElig: 198,
    Ccedil: 199,
    Egrave: 200,
    Eacute: 201,
    Ecirc: 202,
    Euml: 203,
    Igrave: 204,
    Iacute: 205,
    Icirc: 206,
    Iuml: 207,
    ETH: 208,
    Ntilde: 209,
    Ograve: 210,
    Oacute: 211,
    Ocirc: 212,
    Otilde: 213,
    Ouml: 214,
    times: 215,
    Oslash: 216,
    Ugrave: 217,
    Uacute: 218,
    Ucirc: 219,
    Uuml: 220,
    Yacute: 221,
    THORN: 222,
    szlig: 223,
    agrave: 224,
    aacute: 225,
    acirc: 226,
    atilde: 227,
    auml: 228,
    aring: 229,
    aelig: 230,
    ccedil: 231,
    egrave: 232,
    eacute: 233,
    ecirc: 234,
    euml: 235,
    igrave: 236,
    iacute: 237,
    icirc: 238,
    iuml: 239,
    eth: 240,
    ntilde: 241,
    ograve: 242,
    oacute: 243,
    ocirc: 244,
    otilde: 245,
    ouml: 246,
    divide: 247,
    oslash: 248,
    ugrave: 249,
    uacute: 250,
    ucirc: 251,
    uuml: 252,
    yacute: 253,
    thorn: 254,
    yuml: 255,
    quot: 34,
    amp: 38,
    lt: 60,
    gt: 62,
    OElig: 338,
    oelig: 339,
    Scaron: 352,
    scaron: 353,
    Yuml: 376,
    circ: 710,
    tilde: 732,
    ensp: 8194,
    emsp: 8195,
    thinsp: 8201,
    zwnj: 8204,
    zwj: 8205,
    lrm: 8206,
    rlm: 8207,
    ndash: 8211,
    mdash: 8212,
    lsquo: 8216,
    rsquo: 8217,
    sbquo: 8218,
    ldquo: 8220,
    rdquo: 8221,
    bdquo: 8222,
    dagger: 8224,
    Dagger: 8225,
    permil: 8240,
    lsaquo: 8249,
    rsaquo: 8250,
    euro: 8364,
    apos: 39,
};

export { htmlToText };
