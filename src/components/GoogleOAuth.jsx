import React, { useState } from "react";
import PropTypes from "prop-types";

import Button from "./shared/Button";
import ErrorStyled from "./shared/Error";

import { styled } from "../config/stitches.config";
import { URLS } from "../constants/auth";

import {
  createOAuthParams,
  createTokenParams,
  getTokens,
} from "../services/oAuthService";
import { SIGNING_STATUS } from "../constants/user";

const LoginStyled = styled("div", {
  width: "40em",
  height: "33em",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
});

const HeaderStyled = styled("h1", {
  fontSize: "2rem",
});

const FormStyled = styled("form", {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  marginBottom: "1em",

  "& input": {
    marginBottom: "0.5em",
  },

  "& button": {
    marginTop: "0.5em",
  },
});

const initialFormData = {
  clientId: "",
  redirectURI: "",
  clientSecret: "",
};

export default function GoogleOAuth({ handleOAuthResult }) {
  const [formData, setFormData] = useState(initialFormData);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [error, setError] = useState("");

  const handleClickGoogleOAuth = () => {
    const oAuthParams = createOAuthParams(formData);
    const url = `${URLS.GOOGLE_AUTH}?${oAuthParams}`;

    chrome.identity.launchWebAuthFlow(
      { url, interactive: true },
      async (redirectURL) => {
        try {
          const responseURL = new URL(redirectURL);
          const code = responseURL.searchParams.get("code");

          const tokenParams = createTokenParams(formData, code);
          const tokenURL = `${URLS.TOKEN}?${tokenParams}&redirect_uri=${formData.redirectURI}&code=${code}`;

          const tokens = await getTokens(tokenURL);

          if (tokens) {
            chrome.identity.getProfileUserInfo(({ email }) => {
              chrome.storage.sync.set({
                userData: {
                  email,
                  clientId: formData.clientId,
                  name: email.split("@")[0],
                  tokens,
                  signed: SIGNING_STATUS.NOT_CONFIRMED,
                  glossary: null,
                  glossaryId: "",
                  isServerOn: false,
                  translations: [],
                },
              });
            });

            return handleOAuthResult(true);
          }
        } catch (err) {
          return setError(err.message);
        }

        setIsEnrolled(false);
        return handleOAuthResult(false);
      },
    );
  };

  const handleSubmitFormData = (event) => {
    event.preventDefault();
    setIsEnrolled(true);
  };

  const handleChangeInput = ({ target: { name, value } }) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <LoginStyled>
      <HeaderStyled>사용자 인증</HeaderStyled>
      {isEnrolled ? (
        <Button type="button" onClick={handleClickGoogleOAuth} size="middle">
          구글 로그인하여 인증 받기
        </Button>
      ) : (
        <FormStyled onSubmit={handleSubmitFormData}>
          <input
            onChange={handleChangeInput}
            type="text"
            placeholder="client_id"
            name="clientId"
            value={formData.clientId}
          />
          <input
            onChange={handleChangeInput}
            type="text"
            placeholder="redirect_uri"
            name="redirectURI"
            value={formData.redirectURI}
          />
          <input
            onChange={handleChangeInput}
            type="text"
            placeholder="client_secret"
            name="clientSecret"
            value={formData.clientSecret}
          />

          <Button type="submit" size="middle">
            사용자 정보 입력하기
          </Button>
        </FormStyled>
      )}

      {error && <ErrorStyled>{error}</ErrorStyled>}
    </LoginStyled>
  );
}

GoogleOAuth.propTypes = {
  handleOAuthResult: PropTypes.func.isRequired,
};
