import React, { useState } from "react";
import PropTypes from "prop-types";

import { Link } from "react-router-dom";
import Button from "./shared/Button";
import ErrorStyled from "./shared/Error";

import { styled } from "../config/stitches.config";

import { SIGNING_STATUS } from "../constants/user";
import chromeIdentity from "../utils/chromeIdentity";
import chromeStore from "../utils/chromeStore";

const LoginStyled = styled("div", {
  width: "40em",
  height: "33em",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  alignSelf: "center",
  gap: "30px",
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
  gap: "20px",

  "& input": {
    marginBottom: "0.5em",
  },

  "& button": {
    marginTop: "0.5em",
  },
});

const initialFormData = {
  clientId: "",
  projectId: "",
  redirectURI: "",
  clientSecret: "",
};

export default function GoogleOAuth({ handleOAuthResult }) {
  const [formData, setFormData] = useState(initialFormData);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleClickGoogleOAuth = async () => {
    try {
      const tokens = await chromeIdentity.getTokensByOAuth(formData);
      const email = await chromeIdentity.getUserEmail();

      const initialUserData = {
        email,
        clientSecret: formData.clientSecret,
        clientId: formData.clientId,
        projectId: formData.projectId,
        bucketId: email.replace(/@|\./g, ""),
        name: email.split("@")[0],
        tokens,
        signed: SIGNING_STATUS.NOT_CONFIRMED,
        glossary: null,
        glossaryId: "",
        isServerOn: false,
        translations: [],
      };

      await chromeStore.set("userData", initialUserData);

      handleOAuthResult(true);
    } catch (error) {
      setErrorMessage(error.message);
      setIsEnrolled(false);
      handleOAuthResult(false);
    }
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
            placeholder="project_id"
            name="projectId"
            value={formData.projectId}
          />
          <input
            onChange={handleChangeInput}
            type="text"
            placeholder="client_secret"
            name="clientSecret"
            value={formData.clientSecret}
          />
          <input
            onChange={handleChangeInput}
            type="text"
            placeholder="redirect_uri"
            name="redirectURI"
            value={formData.redirectURI}
          />

          <Button css={{ fontSize: "15px" }} type="submit" size="middle">
            OAuth2 정보 입력하기
          </Button>
          <div>
            <a
              target="_blank"
              href="https://my-hand-translator.github.io/#/get-started"
              rel="noreferrer"
            >
              OAuth2 입력 방법 알아보기
            </a>
          </div>
        </FormStyled>
      )}

      {errorMessage && <ErrorStyled>{errorMessage}</ErrorStyled>}
    </LoginStyled>
  );
}

GoogleOAuth.propTypes = {
  handleOAuthResult: PropTypes.func.isRequired,
};
