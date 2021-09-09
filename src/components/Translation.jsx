import React from "react";
import PropTypes from "prop-types";

import TextBox from "./shared/TextBox";
import SubTitle from "./shared/SubTitle";
import ContainerStyled from "./shared/Container";

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
  handleChangeTextarea,
  translationResult,
  originText,
}) {
  const { translation, notification } = translationResult;

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
        <SubTitle fontSize="small" color="apricot">
          {notification}
        </SubTitle>
        <TextBox border="black">
          {translation || "번역 결과가 표시됩니다."}
        </TextBox>
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
};

Translation.defaultProps = {
  originText: "",
  translationResult: {
    translation: "",
    notification: "",
  },
};
