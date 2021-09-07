import React, { useState, useEffect } from "react";
import { styled } from "../config/stitches.config";
import { PARAMS, URLS } from "../constants/auth";

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

const ButtonStyled = styled("button", {
  color: "white",
  fontWeight: "bold",
  fontSize: "1rem",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
  border: "none",
  outline: "none",
  borderRadius: "4px",
  background: "$lightBlue",

  variants: {
    size: {
      small: {
        width: "60px",
        height: "30px",
      },
      middle: {
        width: "130px",
        height: "60px",
      },
    },
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
    chrome.storage.sync.get(["formData"], result => {
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
    const scope = `${PARAMS.SCOPES.PROFILE} ${PARAMS.SCOPES.EMAIL} ${PARAMS.SCOPES.CLOUD_PLATFORM} ${PARAMS.SCOPES.CLOUD_TRANSLATION} ${PARAMS.SCOPES.DEV_STORAGE}`;

    const config = {
      client_id: formData.clientId,
      redirect_uri: formData.redirectURI,
      scope,
      response_type: PARAMS.CODE,
      prompt: PARAMS.SELECT_ACCOUNT,
    };

    const params = new URLSearchParams(config).toString();
    const url = `${URLS.GOOGLE_AUTH}?${params}`;

    chrome.identity.launchWebAuthFlow(
      { url, interactive: true },
      redirectURL => {
        const code = redirectURL.split("code=")[1].split("&")[0];
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
