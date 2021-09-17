import React from "react";
import PropTypes from "prop-types";

import { styled } from "../config/stitches.config";

import SubTitle from "./shared/SubTitle";
import ContainerStyled from "./shared/Container";
import Button from "./shared/Button";

const TranslationContainer = styled(ContainerStyled, {});

const TextBox = styled("p", {
  color: "$black",
  padding: "10px",
  fontSize: "15px",
  borderRadius: "10px",

  variants: {
    color: {
      blue: { color: "$blue" },
      lightBlue: { color: "$lightBlue" },
      apricot: { color: "$apricot" },
      white: { color: "$white" },
    },

    fontSize: {
      big: { fontSize: "30px" },
      small: { fontSize: "10px" },
    },

    border: {
      black: {
        border: "1px solid $black",
      },
    },
  },
});

const Textarea = styled("textarea", {
  minHeight: "150px",
  minWidth: "300px",
  maxWidth: "500px",
  padding: "10px",
  overflow: "auto",
  fontSize: "20px",
  wordWrap: "break-word",
  borderRadius: "10px",
  border: "1px solid $black",

  variants: {
    fontSize: {
      big: { fontSize: "20px" },
      small: { fontSize: "15px" },
    },
  },
});

export default function Translation({
  handleClickGoogleTranslate,
  handleChangeTextarea,
  translationResult,
  originText,
  isOnWebPage,
}) {
  const { translation, notification, glossary } = translationResult;
  const glossaryEntries = Object.entries(glossary || {});

  return (
    <TranslationContainer flex="column" border="black">
      <ContainerStyled flex="column">
        <SubTitle>번역할 문장</SubTitle>

        <Textarea
          type="text"
          placeholder="번역할 문장을 입력해주세요."
          onChange={handleChangeTextarea}
          readOnly={isOnWebPage}
          fontSize={isOnWebPage ? "small" : "big"}
        >
          {originText}
        </Textarea>
      </ContainerStyled>

      <ContainerStyled flex="column">
        <SubTitle>
          번역 결과{" "}
          {notification && notification !== "구글 API" && (
            <Button onClick={handleClickGoogleTranslate}>
              내 용어집으로 번역하기
            </Button>
          )}
        </SubTitle>
        {notification && (
          <SubTitle fontSize="middle" color="apricot">
            {notification} 에서 찾은 번역 결과입니다.
          </SubTitle>
        )}

        <TextBox border="black">
          {translation || "번역 결과가 표시됩니다."}
        </TextBox>

        <SubTitle>사용한 용어집</SubTitle>
        <ul>
          {glossaryEntries.map(([origin, target]) => (
            <li key={origin}>{`[${origin}]을 [${target}]로 번역`}</li>
          ))}
        </ul>
      </ContainerStyled>
    </TranslationContainer>
  );
}

Translation.propTypes = {
  originText: PropTypes.string,
  translationResult: PropTypes.objectOf({
    translation: PropTypes.string,
    notification: PropTypes.string,
  }),
  handleChangeTextarea: PropTypes.func,
  handleClickGoogleTranslate: PropTypes.func.isRequired,
  isOnWebPage: PropTypes.bool,
};

Translation.defaultProps = {
  originText: "",
  translationResult: {
    translation: "",
    notification: "",
  },
  isOnWebPage: false,
  handleChangeTextarea: () => {},
};
