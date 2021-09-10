import React, { useEffect, useRef, useState } from "react";
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
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [glossary, setGlossary] = useState(null);
  const [wordsToAdd, setWordsToAdd] = useState(initWordsToAdd);

  const focus = useRef(null);

  useEffect(() => {
    chrome.storage.sync.get(["userData"], async ({ userData }) => {
      if (chrome.runtime.lastError) {
        setIsLoading(false);
        setError(chrome.runtime.lastError.message);
        return;
      }

      setUser(userData);
      setGlossary(userData.glossary);
      setIsLoading(false);
    });
  }, []);

  const handleWordsChange = (event) => {
    const { name, value } = event.target;

    setError(null);

    setWordsToAdd({
      ...wordsToAdd,
      [name]: value,
    });
  };

  const handleAddGlossary = (event) => {
    event.preventDefault();

    const { text, translation } = wordsToAdd;

    if (!text || !text.trim()) {
      return setError("원문 단어을 입력해 주세요");
    }

    if (!translation || !translation.trim()) {
      return setError("번역 할 단어를 입력해 주세요");
    }

    if (glossary[text] === translation) {
      return setError("이미 등록되어 있습니다.");
    }

    setGlossary({
      ...glossary,
      [text]: translation,
    });

    setWordsToAdd(initWordsToAdd);

    return focus.current.focus();
  };

  const handleDeleteGlossary = (text) => {
    const copyGlossary = { ...glossary };

    delete copyGlossary[text];

    setGlossary(copyGlossary);
  };

  if (isLoading) {
    return <TabContainer>로딩 중...</TabContainer>;
  }

  return (
    <TabContainer>
      <ContainerStyled justify="spaceBetween">
        <Title>{user.glossary ? "용어집 편집" : "용어집 생성"}</Title>
        <Button size="midium">제출</Button>
      </ContainerStyled>

      <SubTitle>좌측 단어는 우측 단어로 번역됩니다.</SubTitle>

      <ErrorStyled css={{ height: "16px" }}>{error}</ErrorStyled>

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

      {glossary &&
        Object.keys(glossary).map((text) => {
          return (
            <ContainerStyled id={text} justify="spaceEvenly" align="itemCenter">
              <div name="text">{text} </div>
              <p>{"->"}</p>
              <div name="translation">{glossary[text]} </div>
              <Button size="small" onClick={() => handleDeleteGlossary(text)}>
                삭제
              </Button>
            </ContainerStyled>
          );
        })}
    </TabContainer>
  );
}

export default EditGlossary;
