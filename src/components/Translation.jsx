import React from "react";
import PropTypes from "prop-types";

import TextBox from "./shared/TextBox";
import SubTitle from "./shared/SubTitle";
import ContainerStyled from "./shared/Container";
import Button from "./shared/Button";

import { styled } from "../config/stitches.config";

const Textarea = styled("textarea", {
  padding: "10px",
  overflow: "auto",
  fontSize: "20px",
  borderRadius: "10px",
  wordWrap: "break-word",
  border: "1px solid $black",

  variants: {
    boxType: {
      translation: { width: "400px", height: "200px" },
    },
    fontSize: {
      big: { fontSize: "30px" },
      small: { fontSize: "10px" },
    },
  },
});

export default function Translation({
  handleClickGoogleTranslate,
  handleChangeTextarea,
  translationResult,
  originText,
}) {
  const { translation, notification, glossary } = translationResult;

  return (
    <ContainerStyled flex="column" border="black">
      <ContainerStyled flex="column">
        <SubTitle>번역할 문장</SubTitle>

        <Textarea
          boxType="translation"
          type="text"
          placeholder="번역할 문장을 입력해주세요."
          onChange={handleChangeTextarea}
        >
          {originText}
        </Textarea>
      </ContainerStyled>

      <ContainerStyled flex="column">
        <SubTitle>번역 결과</SubTitle>
        {notification && (
          <SubTitle fontSize="middle" color="apricot">
            {notification} 에서 찾은 번역 결과입니다.
            {notification !== "구글 API" && (
              <Button onClick={handleClickGoogleTranslate}>
                내 용어집으로 번역하기
              </Button>
            )}
          </SubTitle>
        )}

        <TextBox border="black">
          {translation || "번역 결과가 표시됩니다."}
        </TextBox>

        <SubTitle>사용한 용어집</SubTitle>
        <ul>
          {glossary &&
            Object.entries(glossary).map(([origin, target]) => (
              <li key={origin}>{`[${origin}]을 [${target}]로 번역`}</li>
            ))}
        </ul>
      </ContainerStyled>
    </ContainerStyled>
  );
}

Translation.propTypes = {
  originText: PropTypes.string,
  translationResult: PropTypes.objectOf({
    translation: PropTypes.string,
    notification: PropTypes.string,
  }),
  handleChangeTextarea: PropTypes.func.isRequired,
  handleClickGoogleTranslate: PropTypes.func.isRequired,
};

Translation.defaultProps = {
  originText: "",
  translationResult: {
    translation: "",
    notification: "",
  },
};
