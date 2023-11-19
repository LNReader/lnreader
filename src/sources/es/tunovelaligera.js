// Este es un script de fuente para LNReader que obtiene los datos de la página web tunovelaligera.com
// Se importan los módulos necesarios
const {Source} = require("../source");
const cheerio = require("cheerio");
const queryString = require("query-string");

// Se define la clase Tunovelaligera que hereda de la clase Source
class Tunovelaligera extends Source {
    // Se define el constructor con los parámetros necesarios
    constructor() {
        super();
        this.name = "Tunovelaligera";
        this.url = "https://tunovelaligera.com/";
        this.language = "es";
        this.icon = "https://tunovelaligera.com/wp-content/uploads/2020/07/cropped-Logo-1-32x32.png";
        this.covers = "https://tunovelaligera.com/wp-content/uploads/";
    }

    // Se define el método async getNovels que devuelve una lista de novelas disponibles
    async getNovels(page) {
        // Se crea una variable para almacenar la url de la página
        let url = this.url + "novelas/page/" + page + "/";
        // Se hace una petición HTTP GET a la url y se obtiene el contenido HTML
        let html = await this.fetch(url);
        // Se carga el HTML con la librería cheerio
        let $ = cheerio.load(html);
        // Se crea una variable para almacenar la lista de novelas
        let novels = [];
        // Se seleccionan los elementos que contienen la información de las novelas
        $(".post-item").each((i, e) => {
            // Se extrae el título, la url, el identificador y la imagen de la novela
            let title = $(e).find(".post-title").text().trim();
            let novelUrl = $(e).find(".post-title a").attr("href");
            let novelId = novelUrl.split("/")[4];
            let image = $(e).find(".post-image img").attr("src");
            // Se crea un objeto con los datos de la novela y se añade a la lista
            novels.push({
                name: title,
                url: novelUrl,
                sourceId: this.id,
                novelId: novelId,
                image: image,
            });
        });
        // Se devuelve la lista de novelas
        return novels;
    }

    // Se define el método async getNovel que devuelve los detalles de una novela
    async getNovel(novelId) {
        // Se crea una variable para almacenar la url de la novela
        let url = this.url + "novela/" + novelId + "/";
        // Se hace una petición HTTP GET a la url y se obtiene el contenido HTML
        let html = await this.fetch(url);
        // Se carga el HTML con la librería cheerio
        let $ = cheerio.load(html);
        // Se extrae el título, la imagen, el autor, el artista, el estado, el género y la sinopsis de la novela
        let title = $(".post-title").text().trim();
        let image = $(".summary_image img").attr("src");
        let author = $(".author-content").text().trim();
        let artist = $(".artist-content").text().trim();
        let status = $(".status-content").text().trim();
        let genre = $(".genres-content").text().trim();
        let summary = $(".summary__content").text().trim();
        // Se crea un objeto con los datos de la novela
        let novel = {
            name: title,
            url: url,
            sourceId: this.id,
            novelId: novelId,
            image: image,
            author: author,
            artist: artist,
            status: status,
            genre: genre,
            summary: summary,
        };
        // Se devuelve el objeto de la novela
        return novel;
    }

    // Se define el método async getChapters que devuelve una lista de capítulos de una novela
    async getChapters(novelId) {
        // Se crea una variable para almacenar la url de la novela
        let url = this.url + "novela/" + novelId + "/";
        // Se hace una petición HTTP GET a la url y se obtiene el contenido HTML
        let html = await this.fetch(url);
        // Se carga el HTML con la librería cheerio
        let $ = cheerio.load(html);
        // Se crea una variable para almacenar la lista de capítulos
        let chapters = [];
        // Se seleccionan los elementos que contienen la información de los capítulos
        $(".wp-manga-chapter").each((i, e) => {
            // Se extrae el título, la url y la fecha de publicación del capítulo
            let title = $(e).find("a").text().trim();
            let chapterUrl = $(e).find("a").attr("href");
            let time = $(e).find("span").text().trim();
            // Se crea un objeto con los datos del capítulo y se añade a la lista
            chapters.push({
                name: title,
                url: chapterUrl,
                releaseDate: time,
            });
        });
        // Se invierte el orden de la lista para que los capítulos más recientes estén al final
        chapters.reverse();
        // Se devuelve la lista de capítulos
        return chapters;
    }

    // Se define el método async getChapter que devuelve el contenido de un capítulo
    async getChapter(chapterUrl) {
        // Se hace una petición HTTP GET a la url del capítulo y se obtiene el contenido HTML
        let html = await this.fetch(chapterUrl);
        // Se carga el HTML con la librería cheerio
        let $ = cheerio.load(html);
        // Se selecciona el elemento que contiene el contenido del capítulo
        let content = $(".reading-content");
        // Se eliminan los elementos innecesarios del contenido
        content.find("div, script, a, span, br").remove();
        // Se extrae el texto del contenido y se limpia de espacios en blanco
        let text = content.text().trim();
        // Se devuelve el texto del capítulo
        return text;
    }

    // Se define el método async searchNovels que devuelve una lista de novelas que coinciden con una consulta de búsqueda
    async searchNovels(query) {
        // Se crea una variable para almacenar la url de búsqueda
        let url = this.url + "?s=" + query + "&post_type=wp-manga";
        // Se hace una petición HTTP GET a la url de búsqueda y se obtiene el contenido HTML
        let html = await this.fetch(url);
        // Se carga el HTML con la librería cheerio
        let $ = cheerio.load(html);
        // Se crea una variable para almacenar la lista de novelas
        let novels = [];
        // Se seleccionan los elementos que contienen la información de las novelas
        $(".post-item").each((i, e) => {
            // Se extrae el título, la url, el identificador y la imagen de la novela
            let title = $(e).find(".post-title").text().trim();
            let novelUrl = $(e).find(".post-title a").attr("href");
            let novelId = novelUrl.split("/")[4];
            let image = $(e).find(".post-image img").attr("src");
            // Se crea un objeto con los datos de la novela y se añade a la lista
            novels.push({
                name: title,
                url: novelUrl,
                sourceId: this.id,
                novelId: novelId,
                image: image,
            });
        });
        // Se devuelve la lista de novelas
        return novels;
    }
}

// Se exporta la clase Tunovelaligera como un módulo
module.exports = {
    Tunovelaligera: Tunovelaligera,
};
