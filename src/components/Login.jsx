import React, { useState, useEffect } from "react";

import ButtonStyled from "./Button";
import ErrorStyled from "./Error";

import { styled } from "../config/stitches.config";
import { URLS } from "../constants/auth";

import {
  createOAuthParams,
  createTokenParams,
  getTokens,
} from "../services/loginService";

const HeaderStyled = styled("h1", {
  fontSize: "3rem",
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

export default function Login() {
  const [formData, setFormData] = useState({
    clientId: "",
    redirectURI: "",
    clientSecret: "",
  });
  const [error, setError] = useState();
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get(["formData"], (result) => {
      if (chrome.runtime.lastError) {
        setError(chrome.runtime.lastError.message);
      }

      if (result.formData) {
        setFormData(result.formData);
        setIsEnrolled(true);
      }
    });
  }, []);

  const handleClick = () => {
    chrome.storage.sync.set({ formData });

    setIsEnrolled(true);
  };

  const handleLoginClick = () => {
    const oAuthParams = createOAuthParams(formData);
    const url = `${URLS.GOOGLE_AUTH}?${oAuthParams}`;

    chrome.identity.launchWebAuthFlow(
      { url, interactive: true },
      async (redirectURL) => {
        const responseURL = new URL(redirectURL);
        const code = responseURL.searchParams.get("code");

        const tokenParams = createTokenParams(formData, code);
        const tokenURL = `${URLS.TOKEN}?${tokenParams}&redirect_uri=${formData.redirectURI}&code=${code}`;

        try {
          const tokens = await getTokens(tokenURL);

          if (tokens) {
            chrome.storage.sync.set({ tokens });
          }
        } catch (err) {
          setError(err.message);
        }
      },
    );
  };

  const setFormInput = (target, formKey) => {
    setFormData({
      ...formData,
      [formKey]: target.value,
    });
  };

  return (
    <>
      <HeaderStyled>Login</HeaderStyled>
      <FormStyled>
        <input
          type="text"
          placeholder="client_id"
          onChange={({ target }) => setFormInput(target, "clientId")}
          disabled={isEnrolled}
        />
        <input
          type="text"
          placeholder="redirect_uri"
          onChange={({ target }) => setFormInput(target, "redirectURI")}
          disabled={isEnrolled}
        />
        <input
          type="text"
          placeholder="client_secret"
          onChange={({ target }) => setFormInput(target, "clientSecret")}
          disabled={isEnrolled}
        />
        <ButtonStyled
          type="button"
          disabled={isEnrolled}
          onClick={handleClick}
          size="small"
        >
          enroll
        </ButtonStyled>
      </FormStyled>
      <ButtonStyled
        type="button"
        onClick={handleLoginClick}
        size="middle"
        disabled={!isEnrolled}
      >
        Google Login
      </ButtonStyled>
      {error && <ErrorStyled>{error}</ErrorStyled>}
    </>
  );
}
