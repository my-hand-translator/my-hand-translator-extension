import React, { useEffect, useState } from "react";

import { nanoid } from "nanoid";

import ContainerStyled from "./shared/Container";
import ErrorStyled from "./shared/Error";
import Button from "./shared/Button";
import Title from "./shared/Title";

import Signup from "./Signup";
import Login from "./GoogleOAuth";
import Translation from "./Translation";

import {
  addTranslations,
  editGlossary,
  getGlossary,
  login,
} from "../services/userService";
import { SIGNING_STATUS } from "../constants/user";
import {
  getGlossaryFromGoogleCloudAPI,
  getTranslationFromChromeStorage,
  getTranslationFromGoogleCloudAPI,
  getTranslationFromServer,
  sendTranslationResult,
} from "../services/translationService";

const TAB_BASE_URL = `chrome-extension://${chrome.runtime.id}/options.html#/`;

export default function Popup() {
  const [isOAuthSuccess, setIsOAuthSuccess] = useState(false);
  const [isServerOn, setIsServerOn] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [originText, setOriginText] = useState("");
  const [translationResult, setTranslationResult] = useState({
    translation: "",
    notification: "",
    glossary: {},
  });

  useEffect(() => {
    chrome.storage.sync.get(["userData"], async ({ userData }) => {
      if (chrome.runtime.lastError) {
        setError(chrome.runtime.lastError.message);

        return setIsOAuthSuccess(false);
      }

      if (userData) {
        setUser(userData);
        setIsServerOn(userData.isServerOn);

        const glossary = await getGlossaryFromGoogleCloudAPI(
          userData.tokens.accessToken,
        );

        chrome.storage.sync.set({ userData: { ...userData, glossary } });

        return setIsOAuthSuccess(true);
      }

      return setIsOAuthSuccess(false);
    });
  }, [isOAuthSuccess]);

  const updateUserSigningStatus = (status) => {
    setUser((prevUser) => {
      const signingStatus = status
        ? SIGNING_STATUS.CONFIRMED
        : SIGNING_STATUS.UNDERWAY;

      const newUser = { ...prevUser, signed: signingStatus, isServerOn: true };

      chrome.storage.sync.set({ userData: newUser });

      return newUser;
    });
  };

  const synchronizeUserAndServer = () => {
    chrome.storage.sync.get(["userData"], ({ userData }) => {
      if (!userData) {
        return setError("유저 데이터가 없습니다.");
      }

      try {
        (async () => {
          const gettingGlossaryResponse = await getGlossary(userData);

          if (gettingGlossaryResponse.result !== "ok") {
            throw gettingGlossaryResponse;
          }

          const mergedGlossary = {
            ...userData.glossary,
            ...gettingGlossaryResponse.data,
          };

          const newUserData = { ...userData, glossary: mergedGlossary };

          const editingGlossaryResponse = await editGlossary(newUserData);

          if (editingGlossaryResponse.result !== "ok") {
            throw editingGlossaryResponse;
          }

          chrome.storage.sync.set({ userData: newUserData });
          setUser(newUserData);
        })();
      } catch (err) {
        setError(err.message);
      }

      try {
        (async () => {
          const response = await addTranslations(userData);

          if (response.result !== "ok") {
            throw response;
          }
        })();
      } catch (err) {
        setError(err.message);
      }

      return null;
    });
  };

  const handleToggleServerConnection = async () => {
    if (isServerOn) {
      chrome.storage.sync.set({
        userData: { ...user, isServerOn: false },
      });

      return setIsServerOn(false);
    }

    try {
      const loginResult = await login(user);

      if (loginResult.result !== "ok") {
        throw loginResult;
      }

      const newUserData = { ...user, glossaryId: loginResult.glossaryId };

      chrome.storage.sync.set({ userData: newUserData });
      setUser(newUserData);

      updateUserSigningStatus(loginResult.isUser);

      if (loginResult.isUser) {
        synchronizeUserAndServer();
      }

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

  const handleChangeTextarea = ({ target: { value } }) => {
    setOriginText(value);
  };

  const googleTranslate = async () => {
    chrome.storage.sync.get("currentUrl", async ({ currentUrl }) => {
      const translated = await getTranslationFromGoogleCloudAPI(
        user,
        originText,
      );

      if (translated.error) {
        return setError("구글 API 번역 요청 중 에러가 발생했습니다.");
      }

      const { translatedText } = translated.glossaryTranslations[0];

      const currentTranslationResult = {
        text: originText,
        translated: translatedText,
        url: currentUrl,
        glossary: user.glossary,
        createdAt: new Date().toISOString(),
        nanoId: nanoid(),
      };

      chrome.storage.sync.set({
        userData: {
          ...user,
          translations: user.translations.concat(currentTranslationResult),
        },
      });

      if (isServerOn) {
        const response = await sendTranslationResult(
          user,
          currentTranslationResult,
        );

        if (response.result !== "ok") {
          setError("서버에 번역 결과를 저장하는데 실패했습니다.");
        }
      }

      return setTranslationResult({
        translation: translatedText,
        notification: "구글 API",
        glossary: user.glossary,
      });
    });
  };

  const handleClickTranslation = async () => {
    try {
      let translated = await getTranslationFromChromeStorage(
        user.translations,
        originText,
      );

      if (translated) {
        return setTranslationResult({
          translation: translated.translated,
          notification: "로컬 스토리지",
          glossary: translated.glossary,
        });
      }

      if (isServerOn) {
        translated = await getTranslationFromServer(user, originText);

        if (translated.result !== "ok") {
          return setError(translated.error.message);
        }
      }

      if (isServerOn && translated.data) {
        return setTranslationResult({
          translation: translated.data.translated,
          notification: "서버",
          glossary: translated.data.glossary,
        });
      }

      return googleTranslate();
    } catch (err) {
      return setError(err.message || err.error.message);
    }
  };

  const handleClickOptionButton = ({ target: { name } }) => {
    chrome.tabs.create({ url: TAB_BASE_URL + name });
  };

  return (
    <ContainerStyled flex="column">
      <Title align="center">내 손 번역</Title>

      {error && <ErrorStyled>{error}</ErrorStyled>}

      {isOAuthSuccess ? (
        <ContainerStyled flex="column">
          <ContainerStyled flex="row" justify="spaceBetween">
            <Button bgColor="blue" onClick={handleClickTranslation}>
              번역하기
            </Button>

            <Button
              onClick={handleToggleServerConnection}
              bgColor={isServerOn ? "blue" : "apricot"}
            >
              {isServerOn ? "서버 연결 끊기" : "서버 연결"}
            </Button>
          </ContainerStyled>

          {user?.signed === SIGNING_STATUS.UNDERWAY ? (
            <Signup handleSignupResult={handleSignupResult} />
          ) : (
            <>
              <Translation
                originText={originText}
                translationResult={translationResult}
                handleClickGoogleTranslate={googleTranslate}
                handleChangeTextarea={handleChangeTextarea}
              />

              <ContainerStyled flex="row" justify="spaceBetween">
                <Button
                  name="my-glossary"
                  bgColor="lightBlue"
                  onClick={handleClickOptionButton}
                >
                  내 용어집 {user.glossary ? "편집" : "생성"} 하기
                </Button>

                <Button
                  name="my-translations"
                  bgColor="lightBlue"
                  onClick={handleClickOptionButton}
                >
                  내 번역 기록 보기
                </Button>
              </ContainerStyled>
            </>
          )}

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
      ) : (
        <Login handleOAuthResult={setIsOAuthSuccess} />
      )}
    </ContainerStyled>
  );
}
