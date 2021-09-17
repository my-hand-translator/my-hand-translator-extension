import React, { useEffect, useState } from "react";

import { styled } from "../config/stitches.config";

import ContainerStyled from "./shared/Container";
import ErrorStyled from "./shared/Error";
import Button from "./shared/Button";
import Title from "./shared/Title";

import Signup from "./Signup";
import GoogleOAuth from "./GoogleOAuth";
import Translation from "./Translation";

import { login, synchronizeUserAndServer } from "../services/userService";
import {
  getGlossaryFromGoogleCloudAPI,
  getTranslationResult,
  googleTranslate,
} from "../services/translationService";
import chromeStore from "../utils/chromeStore";
import { SIGNING_STATUS } from "../constants/user";

const TAB_BASE_URL = `chrome-extension://${chrome.runtime.id}/options.html#/`;

const PopupContainer = styled(ContainerStyled, {
  maxWidth: "500px",
  width: "max-content",
  height: "max-content",
});

export default function Popup() {
  const [isServerOn, setIsServerOn] = useState(false);
  const [user, setUser] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [originText, setOriginText] = useState("");
  const [translationResult, setTranslationResult] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasGlossary, setHasGlossary] = useState(false);
  const [isOAuthSuccess, setIsOAuthSuccess] = useState(false);
  const { email, projectId } = user;

  useEffect(() => {
    chrome.storage.onChanged.addListener(({ userData }) => {
      setUser(userData.newValue);
    });
  }, []);

  useEffect(() => {
    setIsLoading(true);

    (async () => {
      try {
        const userData = await chromeStore.get("userData");

        setIsOAuthSuccess(userData?.email && userData?.projectId);

        if (userData) {
          const glossary = await getGlossaryFromGoogleCloudAPI(userData);

          await chromeStore.set("userData", { ...userData, glossary });

          setUser({ ...userData, glossary });
          setIsServerOn(userData.isServerOn);
          setHasGlossary(Boolean(glossary));
        }
      } catch (error) {
        setErrorMessage(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [hasGlossary, isOAuthSuccess]);

  const updateUserSigningStatus = async (status) => {
    const signingStatus = status
      ? SIGNING_STATUS.CONFIRMED
      : SIGNING_STATUS.UNDERWAY;
    const newUser = { ...user, signed: signingStatus, isServerOn: true };

    try {
      await chromeStore.set("userData", newUser);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleToggleServerConnection = async () => {
    try {
      if (isServerOn) {
        await chromeStore.set("userData", { ...user, isServerOn: false });

        return setIsServerOn(false);
      }

      const loginResult = await login(user);

      if (loginResult.result !== "ok") {
        throw loginResult;
      }

      const newUserData = {
        ...user,
        glossaryId: loginResult.glossaryId,
        isServerOn: true,
      };

      await chromeStore.set("userData", newUserData);
      await chromeStore.set("glossaryId", loginResult.glossaryId);

      await updateUserSigningStatus(loginResult.isUser);

      if (loginResult.isUser) {
        await synchronizeUserAndServer(newUserData);
      }

      return setIsServerOn(true);
    } catch (error) {
      setErrorMessage(error.message);

      return setIsServerOn(false);
    }
  };

  const handleSignupResult = async (isSignupSuccess) => {
    setIsServerOn(isSignupSuccess);

    await updateUserSigningStatus(isSignupSuccess);
  };

  const handleChangeTextarea = ({ target: { value } }) => {
    setOriginText(value);
  };

  const handleClickTranslate = async (translateFunction) => {
    setErrorMessage("");

    if (!originText.trim()) {
      return setErrorMessage("번역할 텍스트가 없습니다.");
    }

    try {
      const result = await translateFunction(user, originText);

      return setTranslationResult(result);
    } catch (error) {
      return setErrorMessage(error);
    }
  };

  const handleClickOptionButton = ({ target: { name } }) => {
    chrome.tabs.create({ url: TAB_BASE_URL + name });
  };

  return (
    <PopupContainer flex="column">
      <Title align="center">내손번역</Title>

      {errorMessage && <ErrorStyled>{errorMessage}</ErrorStyled>}

      {isLoading && "Loading ..."}

      {!isLoading && email && projectId && !hasGlossary && (
        <Button
          name="my-glossary"
          bgColor="lightBlue"
          onClick={handleClickOptionButton}
        >
          내 용어집 생성하기
        </Button>
      )}

      {!isLoading && user?.glossary && (
        <ContainerStyled flex="column">
          <ContainerStyled flex="row" justify="spaceBetween">
            <Button
              bgColor="blue"
              onClick={() => handleClickTranslate(getTranslationResult)}
            >
              번역하기
            </Button>

            <Button
              onClick={handleToggleServerConnection}
              bgColor={isServerOn ? "blue" : "apricot"}
            >
              {isServerOn ? "서버 연결 끊기" : "서버 연결"}
            </Button>
          </ContainerStyled>

          {!isLoading &&
          isServerOn &&
          user?.signed === SIGNING_STATUS.UNDERWAY ? (
            <Signup handleSignupResult={handleSignupResult} user={user} />
          ) : (
            <>
              <Translation
                originText={originText}
                translationResult={translationResult}
                handleChangeTextarea={handleChangeTextarea}
                handleClickGoogleTranslate={() => {
                  handleClickTranslate(googleTranslate);
                }}
              />

              <ContainerStyled
                css={{ gap: "30px" }}
                flex="row"
                justify="spaceBetween"
              >
                <Button
                  name="my-glossary"
                  bgColor="lightBlue"
                  onClick={handleClickOptionButton}
                >
                  내 용어집 편집하기
                </Button>

                <Button
                  name="my-translations"
                  bgColor="lightBlue"
                  onClick={handleClickOptionButton}
                >
                  내 번역 기록 보기
                </Button>

                {isServerOn && (
                  <Button
                    name="other-glossaries"
                    bgColor="lightBlue"
                    onClick={handleClickOptionButton}
                  >
                    다른 사람 용어집 구경하기
                  </Button>
                )}
              </ContainerStyled>
            </>
          )}
        </ContainerStyled>
      )}

      {!isLoading && (!email || !projectId) && (
        <GoogleOAuth handleOAuth={setIsOAuthSuccess} />
      )}
    </PopupContainer>
  );
}
