import { PARAMS } from "../constants/auth";

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

export { createOAuthParams, createTokenParams, getTokens };
