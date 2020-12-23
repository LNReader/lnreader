import cheerio from "cheerio-without-node-native";

const baseUrl = "https://boxnovel.com/";

export const getLatest = async () => {
    const response = await fetch(baseUrl); // fetch page
    const htmlString = await response.text(); // get response text
    const $ = cheerio.load(htmlString); // parse HTML string
    let title = $("title");

    console.log(title.text());
};
