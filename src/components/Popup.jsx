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
import {
  getGlossaryFromGoogleCloudAPI,
  getTranslationFromChromeStorage,
  getTranslationFromGoogleCloudAPI,
  getTranslationFromServer,
  sendTranslationResult,
} from "../services/translationService";

import { SIGNING_STATUS } from "../constants/user";
import chromeStore from "../utils/chromeStore";

const TAB_BASE_URL = `chrome-extension://${chrome.runtime.id}/options.html#/`;

export default function Popup() {
  const [isOAuthSuccess, setIsOAuthSuccess] = useState(false);
  const [isServerOn, setIsServerOn] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [originText, setOriginText] = useState("");
  const [translationResult, setTranslationResult] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const userData = await chromeStore.get("userData");

        if (userData) {
          setUser(userData);
          setIsServerOn(userData.isServerOn);

          const glossary = await getGlossaryFromGoogleCloudAPI(userData);

          await chromeStore.set("userData", { ...userData, glossary });

          return setIsOAuthSuccess(true);
        }

        return setIsOAuthSuccess(false);
      } catch (err) {
        return setError(err);
      }
    })();
  }, [isOAuthSuccess]);

  const updateUserSigningStatus = async (status) => {
    const signingStatus = status
      ? SIGNING_STATUS.CONFIRMED
      : SIGNING_STATUS.UNDERWAY;
    const newUser = { ...user, signed: signingStatus, isServerOn: true };

    try {
      await chromeStore.set("userData", newUser);
    } catch (err) {
      setError(err.message);
    }

    setUser(newUser);
  };

  const synchronizeUserAndServer = async () => {
    const userData = await chromeStore.get("userData");

    if (!userData) {
      return setError("유저 데이터가 없습니다.");
    }

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
      setError(editingGlossaryResponse.error.message);
    }

    await chromeStore.set("userData", newUserData);

    setUser(newUserData);

    const addingTranslationResponse = await addTranslations(userData);

    if (addingTranslationResponse.result !== "ok") {
      setError(addingTranslationResponse.error.message);
    }

    return true;
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

      const newUserData = { ...user, glossaryId: loginResult.glossaryId };

      await chromeStore.set("userData", newUserData);
      await chromeStore.set("glossaryId", loginResult.glossaryId);

      setUser(newUserData);

      await updateUserSigningStatus(loginResult.isUser);

      if (loginResult.isUser) {
        await synchronizeUserAndServer();
      }

      return setIsServerOn(true);
    } catch (err) {
      setError(err.message);
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

  const googleTranslate = async () => {
    try {
      const translated = await getTranslationFromGoogleCloudAPI(
        user,
        originText,
      );
      const currentUrl = await chromeStore.get("currentUrl");

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

      if (isServerOn) {
        const sendingTranslationResponse = await sendTranslationResult(
          user,
          currentTranslationResult,
        );

        if (sendingTranslationResponse.result !== "ok") {
          setError("서버에 번역 결과를 저장하는데 실패했습니다.");
        }
      }

      const newUserData = {
        ...user,
        translations: user.translations.concat(currentTranslationResult),
      };

      await chromeStore.set("userData", newUserData);

      return setTranslationResult({
        translation: translatedText,
        notification: "구글 API",
        glossary: user.glossary,
      });
    } catch (err) {
      return setError(err.message);
    }
  };

  const handleClickTranslation = async () => {
    setError("");

    try {
      const localTranslation = await getTranslationFromChromeStorage(
        user.translations,
        originText,
      );

      if (localTranslation) {
        return setTranslationResult({
          translation: localTranslation.translated,
          notification: "로컬 스토리지",
          glossary: localTranslation.glossary,
        });
      }

      if (isServerOn) {
        const serverTranslation = await getTranslationFromServer(
          user,
          originText,
        );

        if (serverTranslation.result !== "ok") {
          setError(serverTranslation.error.message);
        } else if (
          serverTranslation.result === "ok" &&
          serverTranslation.data
        ) {
          return setTranslationResult({
            translation: serverTranslation.data.translated,
            notification: "서버",
            glossary: serverTranslation.data.glossary,
          });
        }
      }

      return await googleTranslate();
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
