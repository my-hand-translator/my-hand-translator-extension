import ERROR from "../constants/errorMessage";
import { URLS } from "../constants/auth";
import {
  createOAuthParams,
  createTokenParams,
  getTokens,
} from "../services/oAuthService";

const getUserEmail = () =>
  new Promise((resolve, reject) => {
    chrome.identity.getProfileUserInfo(({ email }) => {
      if (chrome.runtime.lastError) {
        reject(ERROR.GET_PROFILE_USER_INFO);
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
          reject(ERROR.LAUNCH_WEB_AUTH_FLOW);
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
            reject(ERROR.GET_TOKENS);
          }
        })();
      },
    );
  });

export default { getUserEmail, getTokensByOAuth };
