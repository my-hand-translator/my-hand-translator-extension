import React, { useEffect, useState } from "react";

import reset from "../config/reset";

import ErrorStyled from "./shared/Error";
import ContainerStyled from "./shared/Container";
import Button from "./shared/Button";
import Title from "./shared/Title";

import Login from "./GoogleOAuth";
import Translation from "./Translation";
import { globalCss } from "../config/stitches.config";
import { SIGNING_STATUS } from "../constants/user";
import Signup from "./Signup";
import { login } from "../services/loginService";

const TAB_BASE_URL = `chrome-extension://${chrome.runtime.id}/options.html#/`;

const initialUserData = {
  email: "",
  name: "",
  tokens: {
    access_token: "",
    id_token: "",
    refresh_token: "",
  },
  clientId: "",
  signed: "not confirmed",
  glossary: {},
};

export default function Popup() {
  const [isOAuthSuccess, setIsOAuthSuccess] = useState(false);
  const [isServerOn, setIsServerOn] = useState(false);
  const [user, setUser] = useState(initialUserData);
  const [error, setError] = useState("");

  useEffect(() => {
    chrome.storage.sync.get(["userData"], ({ userData }) => {
      if (chrome.runtime.lastError) {
        setError(chrome.runtime.lastError.message);

        return setIsOAuthSuccess(false);
      }

      if (userData) {
        setUser(userData);

        if (userData.signed === SIGNING_STATUS.CONFIRMED) {
          setIsServerOn(TextTrackCueList);
        }

        console.log("UserData: ", userData);

        return setIsOAuthSuccess(true);
      }

      return setIsOAuthSuccess(false);
    });
  }, []);

  const updateUserSigningStatus = (status) => {
    setUser((prevUser) => {
      const signingStatus = status
        ? SIGNING_STATUS.CONFIRMED
        : SIGNING_STATUS.UNDERWAY;

      const newUser = {
        ...prevUser,
        signed: signingStatus,
      };

      chrome.storage.sync.set({ userData: newUser });

      return newUser;
    });
  };

  const handleToggleServerConnection = async () => {
    if (!isServerOn) {
      setIsServerOn(false);
    }

    const loginResult = await login(user);

    try {
      if (loginResult.result !== "ok") {
        throw loginResult;
      }

      updateUserSigningStatus(loginResult.isUser);

      return setIsServerOn(true);
    } catch (err) {
      setError(err.message);
    }

    return setIsServerOn(false);
  };

  const handleSignupResult = (isSignupSuccess) => {
    setIsServerOn(isSignupSuccess);
    updateUserSigningStatus(isSignupSuccess);
  };

  const handleClickTranslation = (event) => {
    if (event) {
      // 엔터로 번역 오청
      event.preventDefault();
    } else {
      // 클릭으로 번역 요청
    }
  };

  const handleClickOptionButton = ({ target: { name } }) => {
    chrome.tabs.create({ url: TAB_BASE_URL + name });
  };

  globalCss(reset)();

  return (
    <ContainerStyled flex="column">
      <Title align="center">내 손 번역</Title>
      {error && <ErrorStyled>{error}</ErrorStyled>}
      {isOAuthSuccess ? (
        <ContainerStyled flex="column">
          <ContainerStyled flex="row" justify="spaceBetween">
            <Button onClick={handleClickTranslation}>번역하기</Button>
            <Button
              onClick={handleToggleServerConnection}
              color={isServerOn ? "blue" : "apricot"}
            >
              {isServerOn ? "서버 연결 끊기" : "서버 연결"}
            </Button>
          </ContainerStyled>

          {user.signed === SIGNING_STATUS.UNDERWAY ? (
            <Signup handleSignupResult={handleSignupResult} />
          ) : (
            <Translation handleTranslate={handleClickTranslation} />
          )}

          <ContainerStyled flex="row" justify="spaceBetween">
            <Button name="my-glossary" onClick={handleClickOptionButton}>
              내 용어집 편집하기
            </Button>
            <Button name="my-translations" onClick={handleClickOptionButton}>
              내 번역 기록 보기
            </Button>
          </ContainerStyled>
          {isServerOn && (
            <Button name="other-glossaries" onClick={handleClickOptionButton}>
              다른 사람 용어집 구경하기
            </Button>
          )}
        </ContainerStyled>
      ) : (
        <Login handleOAuthResult={setIsOAuthSuccess} />
      )}
    </ContainerStyled>
  );
}
