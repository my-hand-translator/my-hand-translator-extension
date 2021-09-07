import { PARAMS } from "../constants/auth";

const createOAuthParams = (oAuthData) => {
  const scope = `${PARAMS.SCOPES.PROFILE} ${PARAMS.SCOPES.EMAIL} ${PARAMS.SCOPES.CLOUD_PLATFORM} ${PARAMS.SCOPES.CLOUD_TRANSLATION} ${PARAMS.SCOPES.DEV_STORAGE}`;

  const config = {
    client_id: oAuthData.clientId,
    redirect_uri: oAuthData.redirectURI,
    scope,
    response_type: PARAMS.CODE,
    prompt: PARAMS.SELECT_ACCOUNT,
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

const getAccessToken = async (url) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  return data.access_token;
};

export { createOAuthParams, createTokenParams, getAccessToken };
