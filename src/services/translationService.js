import endPoints from "../constants/server";
import chromeStore from "../utils/chromeStore";

const { WORDS, TRANSLATED, TRANSLATIONS } = endPoints;

const DECIMAL_POINT = 2;
const PERCENTAGE = 100;
const SIMILARITY = 95;

export const getTranslations = async (user, params) => {
  const response = await fetch(
    `${process.env.SERVER_URL}/translations/${user.email}?${params}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.tokens.idToken}`,
      },
    },
  );

  const data = await response.json();

  if (data.result === "error") {
    throw data;
  }

  return data.data;
};

export const createTranslationParam = (page, limit) => {
  const params = {
    page,
    limit,
  };

  return new URLSearchParams(params).toString();
};

export const combineTranslations = (
  storageTranslations,
  serverTranslations,
) => {
  const combinedTranslations = serverTranslations;
  const uniqueNanoIds = new Set();

  combinedTranslations.forEach((combinedTranslation) => {
    uniqueNanoIds.add(combinedTranslation.nanoId);
  });

  storageTranslations.forEach((storageTranslation) => {
    if (!uniqueNanoIds.has(storageTranslation.nanoId)) {
      combinedTranslations.push(storageTranslation);
    }
  });

  return combinedTranslations;
};

const findSimilarTarget = (words, targets, similarity) => {
  if (!targets) {
    return null;
  }

  for (let i = 0; i < targets.length; i += 1) {
    const { text } = targets[i];
    const includedRate = Math.floor(
      (words.length / text.length).toFixed(DECIMAL_POINT) * PERCENTAGE,
    );

    if (includedRate >= similarity) {
      return targets[i];
    }
  }

  return null;
};

export const getTranslationFromChromeStorage = (translations, originText) => {
  const translationsIncludingOrigin = translations.filter(({ text }) =>
    text.includes(originText),
  );

  const translation = findSimilarTarget(
    originText,
    translationsIncludingOrigin,
    SIMILARITY,
  );

  return translation;
};

export const getTranslationFromServer = async ({ tokens }, originText) => {
  const response = await fetch(
    `${process.env.SERVER_URL + WORDS + TRANSLATED}?words=${originText}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokens.idToken}`,
      },
    },
  );

  return response.json();
};

const refreshAndGetNewTokens = async (clientId, clientSecret, refreshToken) => {
  const baseUrl = new URL("https://accounts.google.com/o/oauth2/token");
  const config = {
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  };

  const params = new URLSearchParams(config).toString();
  const response = await fetch(`${baseUrl}?${params}`, { method: "POST" });

  const {
    access_token: accessToken,
    id_token: idToken,
    error,
    error_description: errorDescription,
  } = await response.json();

  const userData = await chromeStore.get("userData");
  await chromeStore.set("userData", {
    ...userData,
    tokens: { ...userData.tokens, accessToken, idToken },
  });

  if (error) {
    throw new Error(errorDescription);
  }
};

export const getTranslationFromGoogleCloudAPI = async (
  { tokens, projectId, clientId, clientSecret },
  originText,
) => {
  await refreshAndGetNewTokens(clientId, clientSecret, tokens.refreshToken);

  const baseUrl = "https://translation.googleapis.com/v3/projects/";
  const urlPostFix = "/locations/us-central1:translateText";

  const response = await fetch(baseUrl + projectId + urlPostFix, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokens.accessToken}`,
    },
    body: JSON.stringify({
      sourceLanguageCode: "en",
      targetLanguageCode: "ko",
      contents: originText.toLowerCase(),
      glossaryConfig: {
        glossary: `projects/${projectId}/locations/us-central1/glossaries/my-glossary`,
      },
    }),
  });

  return response.json();
};

export const getGlossaryFromGoogleCloudAPI = async ({
  email,
  clientId,
  clientSecret,
  tokens: { accessToken, refreshToken },
}) => {
  await refreshAndGetNewTokens(clientId, clientSecret, refreshToken);

  const bucketName = email.replace(/@|\./g, "");
  const url = `https://storage.googleapis.com/storage/v1/b/${bucketName}/o/my-glossary.csv?alt=media`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.text();

  if (data === `No such object: ${bucketName}/my-glossary.csv`) {
    return null;
  }

  const wordPairs = data.split("\r\n").map((wordPair) => wordPair.split(","));
  const glossary = wordPairs.reduce(
    (prev, [origin, target]) => ({ ...prev, [origin]: target }),
    {},
  );

  return glossary;
};

export const sendTranslationResult = async (
  { email, tokens },
  currentTranslationResult,
) => {
  const response = await fetch(
    `${process.env.SERVER_URL}${TRANSLATIONS}/${email}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokens.idToken}`,
      },
      body: JSON.stringify(currentTranslationResult),
    },
  );

  return response.json();
};
