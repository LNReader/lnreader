// Importar las dependencias necesarias
const cheerio = require("cheerio");
const { parseNovelId, parseChapterId } = require("../../utils/parseNovelId");
const { fixRelativePath } = require("../../utils/fixRelativePath");

// Definir la URL base de la fuente
const baseUrl = "https://tunovelaligera.com/";

// Definir la función para obtener la lista de novelas
const getNovels = async (page) => {
  // Construir la URL de la página
  const url = page === 1 ? baseUrl : `${baseUrl}page/${page}/`;

  // Obtener el HTML de la página
  const html = await fetch(url).then((res) => res.text());

  // Cargar el HTML con cheerio
  const $ = cheerio.load(html);

  // Crear un array vacío para almacenar las novelas
  const novels = [];

  // Recorrer cada elemento con la clase .post-item
  $(".post-item").each((_, el) => {
    // Obtener el título de la novela
    const title = $(el).find(".post-title").text().trim();

    // Obtener el enlace de la novela
    const link = $(el).find(".post-title > a").attr("href");

    // Obtener el identificador de la novela
    const novelId = parseNovelId(link);

    // Obtener la imagen de la novela
    const image = $(el).find(".post-image > img").attr("src");

    // Obtener el último capítulo de la novela
    const latestChapter = $(el).find(".post-content > p").text().trim();

    // Añadir la novela al array
    novels.push({ title, link, novelId, image, latestChapter });
  });

  // Devolver el array de novelas
  return novels;
};

// Definir la función para obtener los detalles de una novela
const getNovelDetails = async (novelId) => {
  // Construir la URL de la novela
  const url = `${baseUrl}${novelId}/`;

  // Obtener el HTML de la novela
  const html = await fetch(url).then((res) => res.text());

  // Cargar el HTML con cheerio
  const $ = cheerio.load(html);

  // Obtener el título de la novela
  const title = $(".post-title").text().trim();

  // Obtener la imagen de la novela
  const image = $(".post-image > img").attr("src");

  // Obtener el autor de la novela
  const author = $(".post-content > p:nth-child(2)").text().trim();

  // Obtener el estado de la novela
  const status = $(".post-content > p:nth-child(3)").text().trim();

  // Obtener el género de la novela
  const genre = $(".post-content > p:nth-child(4)").text().trim();

  // Obtener la sinopsis de la novela
  const synopsis = $(".post-content > p:nth-child(5)").text().trim();

  // Crear un objeto vacío para almacenar los detalles de la novela
  const novelDetails = { title, image, author, status, genre, synopsis };

  // Devolver el objeto de detalles de la novela
  return novelDetails;
};

// Definir la función para obtener los capítulos de una novela
const getNovelChapters = async (novelId) => {
  // Construir la URL de la novela
  const url = `${baseUrl}${novelId}/`;

  // Obtener el HTML de la novela
  const html = await fetch(url).then((res) => res.text());

  // Cargar el HTML con cheerio
  const $ = cheerio.load(html);

  // Crear un array vacío para almacenar los capítulos
  const chapters = [];

  // Recorrer cada elemento con la clase .wp-manga-chapter
  $(".wp-manga-chapter").each((_, el) => {
    // Obtener el título del capítulo
    const title = $(el).find("a").text().trim();

    // Obtener el enlace del capítulo
    const link = $(el).find("a").attr("href");

    // Obtener el identificador del capítulo
    const chapterId = parseChapterId(link);

    // Añadir el capítulo al array
    chapters.push({ title, link, chapterId });
  });

  // Devolver el array de capítulos
  return chapters;
};

// Definir la función para obtener el contenido de un capítulo
const getChapterContent = async (novelId, chapterId) => {
  // Construir la URL del capítulo
  const url = `${baseUrl}${novelId}/${chapterId}/`;

  // Obtener el HTML del capítulo
  const html = await fetch(url).then((res) => res.text());

  // Cargar el HTML con cheerio
  const $ = cheerio.load(html);

  // Obtener el título del capítulo
  const title = $(".post-title").text().trim();

  // Obtener el contenido del capítulo
  const content = $(".reading-content")
    .html()
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/<ins[^>]*>.*?<\/ins>/gi, "");

  // Corregir las rutas relativas de las imágenes
  const fixedContent = fixRelativePath(content, baseUrl);

  // Devolver el título y el contenido del capítulo
  return { title, content: fixedContent };
};

// Exportar las funciones
module.exports = {
  getNovels,
  getNovelDetails,
  getNovelChapters,
  getChapterContent,
};
