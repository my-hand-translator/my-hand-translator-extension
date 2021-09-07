import React, { useState, useEffect } from "react";

import ButtonStyled from "./Button";
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

const FormStyled = styled("div", {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  marginBottom: "30px",

  "& input": {
    marginBottom: "5px",
  },

  "& button": {
    marginTop: "10px",
  },
});

export default function Login() {
  const [formData, setFormData] = useState({
    clientId: "",
    redirectURI: "",
    clientSecret: "",
  });
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get(["formData"], (result) => {
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

        const tokens = await getTokens(tokenURL);

        if (tokens) {
          chrome.storage.sync.set({ tokens });
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
    </>
  );
}
