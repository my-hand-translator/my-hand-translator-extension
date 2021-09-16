import { URLS } from "../constants/auth";
import {
  createOAuthParams,
  createTokenParams,
  getTokens,
} from "../services/oAuthService";
import ERROR_MESSAGES from "../constants/errorMessage";

const getUserEmail = () =>
  new Promise((resolve, reject) => {
    chrome.identity.getProfileUserInfo(({ email }) => {
      if (chrome.runtime.lastError) {
        reject(ERROR_MESSAGES.GET_PROFILE_USER_INFO);
      }

      resolve(email);
    });
  });

const getTokensByOAuth = (formData) =>
  new Promise((resolve, reject) => {
    const oAuthParams = createOAuthParams(formData);
    const url = `${URLS.GOOGLE_AUTH}?${oAuthParams}`;

    chrome.identity.launchWebAuthFlow(
      { url, interactive: true },
      (redirectURL) => {
        if (chrome.runtime.lastError) {
          reject(ERROR_MESSAGES.LAUNCH_WEB_AUTH_FLOW);
        }

        const responseURL = new URL(redirectURL);
        const code = responseURL.searchParams.get("code");

        const tokenParams = createTokenParams(formData, code);
        const tokenURL = `${URLS.TOKEN}?${tokenParams}&redirect_uri=${formData.redirectURI}&code=${code}`;

        (async () => {
          try {
            const tokens = await getTokens(tokenURL);

            resolve(tokens);
          } catch (err) {
            reject(ERROR_MESSAGES.GET_TOKENS);
          }
        })();
      },
    );
  });

const getAccessToken = () =>
  new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        reject(ERROR_MESSAGES.GET_TOKENS);
      }

      resolve(token);
    });
  });

export default { getUserEmail, getTokensByOAuth, getAccessToken };
