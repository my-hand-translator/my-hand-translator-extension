import { PARAMS } from "../constants/auth";
import chromeStore from "../utils/chromeStore";

const createOAuthParams = (oAuthData) => {
  const scope = `${PARAMS.SCOPES.PROFILE} ${PARAMS.SCOPES.EMAIL} ${PARAMS.SCOPES.CLOUD_PLATFORM} ${PARAMS.SCOPES.CLOUD_TRANSLATION} ${PARAMS.SCOPES.DEV_STORAGE}`;

  const config = {
    client_id: oAuthData.clientId,
    redirect_uri: oAuthData.redirectURI,
    scope,
    response_type: PARAMS.CODE,
    prompt: PARAMS.CONSENT,
    access_type: PARAMS.OFFLINE,
  };

  return new URLSearchParams(config).toString();
};

const createTokenParams = (oAuthData) => {
  const config = {
    client_id: oAuthData.clientId,
    client_secret: oAuthData.clientSecret,
    grant_type: PARAMS.AUTHORIZATION_CODE,
  };

  return new URLSearchParams(config).toString();
};

const getTokens = async (url) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      id_token: idToken,
    } = await response.json();

    return {
      idToken,
      accessToken,
      refreshToken,
    };
  } catch (err) {
    throw new Error(err);
  }
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

  return { accessToken, idToken };
};

export {
  createOAuthParams,
  createTokenParams,
  getTokens,
  refreshAndGetNewTokens,
};
