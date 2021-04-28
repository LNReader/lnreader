import * as Linking from "expo-linking";
import qs from "qs";

const clientId = "d2f499825d64b0213bb77e78193ccbb1";

const baseOAuthUrl = "https://myanimelist.net/v1/oauth2/authorize";
const baseApiUrl = "https://api.myanimelist.net/v2";

const pkceChallenger = () => {
    const MAX_LENGTH = 88;
    let code = "";

    const codes =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    const randomPicker = () => Math.floor(Math.random() * codes.length);

    for (let index = 0; index < MAX_LENGTH; index++) {
        code += codes.charAt(randomPicker());
    }
    return code;
};

const codeChallenge = pkceChallenger();

const redirectUri = Linking.makeUrl();

export const authUrl = `${baseOAuthUrl}?response_type=code&client_id=${clientId}&code_challenge_method=plain&code_challenge=${codeChallenge}`;

const tokenUrl = `https://myanimelist.net/v1/oauth2/token`;

export const myAnimeListConfig = {
    clientId,
    redirectUri,
    authUrl,
    codeChallenge,
    tokenUrl,
};

export const getAccessToken = async (code, codeChallenge) => {
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
    };

    const body = {
        client_id: myAnimeListConfig.clientId,
        grant_type: "authorization_code",
        code,
        code_verifier: codeChallenge,
    };

    const response = await fetch(myAnimeListConfig.tokenUrl, {
        headers,
        method: "POST",
        body: qs.stringify(body),
    });

    const tokenResponse = await response.json();

    return tokenResponse;
};

export const searchNovels = async (novelName, bearerToken) => {
    const searchrl = `https://api.myanimelist.net/v2/manga?q=${novelName}`;

    const headers = {
        Authorization: "Bearer " + bearerToken,
        "Content-Type": "application/x-www-form-urlencoded",
    };

    const res = await fetch(searchrl, { method: "GET", headers });

    const searchResults = await res.json();

    return searchResults;
};

export const findListItem = async (malId, bearerToken) => {
    const url = `https://api.myanimelist.net/v2/manga/${malId}?fields=id,num_chapters,my_list_status{start_date,finish_date}`;

    const headers = {
        Authorization: "Bearer " + bearerToken,
        "Content-Type": "application/x-www-form-urlencoded",
    };

    const res = await fetch(url, { method: "GET", headers });
    const listItem = await res.json();

    if (!listItem.my_list_status) {
        listItem.my_list_status = {
            status: "reading",
            score: 0,
            num_chapters_read: 0,
        };
    }
    return listItem;
};

export const updateItem = async (malId, bearerToken, body) => {
    const url = `https://api.myanimelist.net/v2/manga/${malId}/my_list_status`;

    const headers = {
        Authorization: "Bearer " + bearerToken,
        "Content-Type": "application/x-www-form-urlencoded",
    };

    const res = await fetch(url, {
        method: "PUT",
        headers,
        body: qs.stringify(body),
    });

    const listItem = await res.json();
    console.log(listItem);
    return listItem;
};
