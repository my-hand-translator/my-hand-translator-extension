import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";

import chromeStore from "../utils/chromeStore";
import {
  createBucket,
  createGlossaryFromGoogleTranslation,
  getCsvFromGoogleStorage,
  getGlossaryFromServer,
  updateCsvFromGoogleStorage,
  updateGlossaryFromServer,
} from "../services/glossaryService";

import GlossaryList from "./GlossaryList";
import Button from "./shared/Button";
import Title from "./shared/Title";
import SubTitle from "./shared/SubTitle";
import ErrorStyled from "./shared/Error";
import ContainerStyled from "./shared/Container";
import TabContainer from "./shared/TabContainer";

const initWordsToAdd = {
  text: "",
  translation: "",
};

function EditGlossary() {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMassage, setErrorMassage] = useState(null);
  const [user, setUser] = useState(null);
  const [glossary, setGlossary] = useState({});
  const [hasBucket, setHasBucket] = useState(null);
  const [bucketId, setBucketId] = useState(null);
  const [wordsToAdd, setWordsToAdd] = useState(initWordsToAdd);

  const focus = useRef(null);
  const history = useHistory();

  useEffect(() => {
    (async () => {
      try {
        const userData = await chromeStore.get("userData");

        setBucketId(userData.email.replace(/@|\./gi, ""));
        setUser(userData);
      } catch (error) {
        setIsLoading(false);
        setErrorMassage(error);
      }
    })();
  }, []);

  useEffect(() => {
    if (user) {
      const {
        isServerOn,
        email,
        tokens: { accessToken },
      } = user;

      (async () => {
        const dataFromGoogle = await getCsvFromGoogleStorage(
          {
            accessToken,
            bucketId,
          },
          setErrorMassage,
        );

        setHasBucket(dataFromGoogle.hasBucket);

        if (isServerOn && dataFromGoogle.hasBucket) {
          const dataFromServer = await getGlossaryFromServer(
            { userId: email, accessToken },
            setErrorMassage,
          );

          Object.assign(dataFromGoogle.glossaryData, dataFromServer);
        }

        setGlossary(dataFromGoogle.glossaryData);
        setIsLoading(false);
      })();
    }
  }, [user]);

  const handleWordsChange = (event) => {
    const { name, value } = event.target;

    setErrorMassage(null);

    setWordsToAdd({
      ...wordsToAdd,
      [name]: value,
    });
  };

  const handleAddGlossary = (event) => {
    event.preventDefault();

    const { text, translation } = wordsToAdd;

    if (!text || !text.trim()) {
      return setErrorMassage("원문 단어을 입력해 주세요");
    }

    if (!translation || !translation.trim()) {
      return setErrorMassage("번역 할 단어를 입력해 주세요");
    }

    if (glossary[text] === translation) {
      return setErrorMassage("이미 등록되어 있습니다.");
    }

    setGlossary({
      ...glossary,
      [text]: translation,
    });

    setWordsToAdd(initWordsToAdd);

    return focus.current.focus();
  };

  const handleDeleteGlossary = (text) => {
    const newGlossary = { ...glossary };

    delete newGlossary[text];

    setGlossary(newGlossary);
  };

  const handleEditGlossary = async () => {
    setIsLoading(true);

    const {
      isServerOn,
      projectId,
      tokens: { accessToken },
    } = user;

    if (!hasBucket) {
      await createBucket({ bucketId, projectId, accessToken }, setErrorMassage);
    }

    const glossaryKeys = Object.keys(glossary);
    let csv = "";

    for (let i = 0; i < glossaryKeys.length; i += 1) {
      const key = glossaryKeys[i];

      csv += `${key},${glossary[key]}\r\n`;
    }

    await updateCsvFromGoogleStorage(
      { csv, bucketId, accessToken },
      setErrorMassage,
    );

    await createGlossaryFromGoogleTranslation(
      { projectId, accessToken, bucketId },
      setErrorMassage,
    );

    if (isServerOn) {
      const glossaryId = await chromeStore.get("glossaryId");

      await updateGlossaryFromServer(
        { glossaryId, glossary, accessToken },
        setErrorMassage,
      );
    }

    try {
      const newUserData = {
        ...user,
        tokens: {
          ...user.tokens,
        },
        glossary,
        bucketId,
      };

      await chromeStore.set("userData", newUserData);
    } catch (error) {
      setErrorMassage(error);
    }

    setIsLoading(false);
    history.push("/");
  };

  if (isLoading) {
    return <TabContainer>로딩 중...</TabContainer>;
  }

  return (
    <TabContainer>
      <ContainerStyled justify="spaceBetween">
        <Title>{user.glossary ? "용어집 편집" : "용어집 생성"}</Title>
        <Button size="medium" onClick={handleEditGlossary}>
          제출
        </Button>
      </ContainerStyled>

      <SubTitle>좌측 단어는 우측 단어로 번역됩니다.</SubTitle>

      <ErrorStyled css={{ height: "16px" }}>{errorMassage}</ErrorStyled>

      <form onSubmit={handleAddGlossary}>
        <ContainerStyled justify="spaceEvenly" align="itemCenter">
          <input
            ref={focus}
            type="text"
            name="text"
            value={wordsToAdd.text}
            onChange={handleWordsChange}
          />
          <p>{"->"}</p>
          <input
            type="text"
            name="translation"
            value={wordsToAdd.translation}
            onChange={handleWordsChange}
          />
          <Button type="submit" size="small">
            추가
          </Button>
        </ContainerStyled>
      </form>

      {glossary && (
        <GlossaryList
          glossaries={glossary}
          buttonText="삭제"
          onButtonClick={handleDeleteGlossary}
        />
      )}
    </TabContainer>
  );
}

export default EditGlossary;
