import { nanoid } from "nanoid";
import END_POINTS from "../constants/server";
import chromeStore from "../utils/chromeStore";
import { refreshAndGetNewTokens } from "./oAuthService";

const { WORDS, TRANSLATED, TRANSLATIONS } = END_POINTS;

const DECIMAL_POINT = 2;
const PERCENTAGE = 100;
const SIMILARITY = 95;

export const getTranslations = async (email, idToken, params) => {
  const response = await fetch(
    `${process.env.SERVER_URL}/translations/${email}?${params}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
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

export const getTranslationFromServer = async ({
  clientId,
  idToken,
  originText,
}) => {
  const response = await fetch(
    `${process.env.SERVER_URL + WORDS + TRANSLATED}?words=${originText}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
        "Client-Id": clientId,
      },
    },
  );

  return response.json();
};

export const getTranslationFromGoogleCloudAPI = async (
  { tokens: { refreshToken }, projectId, clientId, clientSecret },
  originText,
) => {
  const { accessToken } = await refreshAndGetNewTokens(
    clientId,
    clientSecret,
    refreshToken,
  );

  const baseUrl = "https://translation.googleapis.com/v3/projects/";
  const urlPostFix = "/locations/us-central1:translateText";

  const response = await fetch(baseUrl + projectId + urlPostFix, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
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
  tokens: { refreshToken },
}) => {
  const { accessToken } = await refreshAndGetNewTokens(
    clientId,
    clientSecret,
    refreshToken,
  );

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

export const googleTranslate = async (user, originText) => {
  const translated = await getTranslationFromGoogleCloudAPI(user, originText);

  if (translated.error) {
    throw new Error("구글 API 번역 요청 중 에러가 발생했습니다.");
  }

  const { translatedText } = translated.glossaryTranslations[0];
  const currentUrl = await chromeStore.get("currentUrl");

  const currentTranslationResult = {
    text: originText,
    translated: translatedText,
    url: currentUrl,
    glossary: user.glossary,
    createdAt: new Date().toISOString(),
    nanoId: nanoid(),
  };

  if (user.isServerOn) {
    const sendingTranslationResponse = await sendTranslationResult(
      user,
      currentTranslationResult,
    );

    if (sendingTranslationResponse.result !== "ok") {
      throw new Error("서버에 번역 결과를 저장하는데 실패했습니다.");
    }
  }

  if (user.translations.length >= 5) {
    user.translations.shift();
  }

  const newUserData = {
    ...user,
    translations: user.translations.concat(currentTranslationResult),
  };

  await chromeStore.set("userData", newUserData);

  return {
    translation: translatedText,
    notification: "구글 API",
    glossary: user.glossary,
  };
};

export const getTranslationResult = async (user, originText) => {
  const {
    clientId,
    translations,
    isServerOn,
    tokens: { idToken },
  } = user;
  const localTranslation = await getTranslationFromChromeStorage(
    translations,
    originText,
  );

  if (localTranslation) {
    return {
      translation: localTranslation.translated,
      notification: "로컬 스토리지",
      glossary: localTranslation.glossary,
    };
  }

  if (isServerOn) {
    const serverTranslation = await getTranslationFromServer({
      clientId,
      idToken,
      originText,
    });

    if (serverTranslation.result !== "ok") {
      throw serverTranslation.error.message;
    } else if (serverTranslation.result === "ok" && serverTranslation.data) {
      return {
        translation: serverTranslation.data.translated,
        notification: "서버",
        glossary: serverTranslation.data.glossary,
      };
    }
  }

  return googleTranslate(user, originText);
};
