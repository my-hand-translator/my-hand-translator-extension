import React from "react";
import PropTypes from "prop-types";

import ContainerStyled from "./shared/Container";
import TextBox from "./shared/TextBox";
import SubTitle from "./shared/SubTitle";

import { styled } from "../config/stitches.config";

const Textarea = styled("textarea", {
  fontSize: "20px",
  borderRadius: "10px",
  border: "1px solid $black",
  wordWrap: "break-word",
  overflow: "auto",
  padding: "10px",

  variants: {
    boxType: {
      translation: {
        width: "400px",
        height: "200px",
      },
    },
    fontSize: {
      big: { fontSize: "30px" },
      small: { fontSize: "10px" },
    },
  },
});

export default function Translation({ handleTranslate, textInput }) {
  return (
    <ContainerStyled flex="column" border="black">
      <form onSubmit={handleTranslate}>
        <ContainerStyled flex="column">
          <SubTitle>번역할 문장</SubTitle>
          <Textarea
            boxType="translation"
            type="text"
            placeholder="번역할 문장을 입력해주세요."
          />
        </ContainerStyled>
      </form>
      <ContainerStyled flex="column">
        <SubTitle>번역 결과</SubTitle>
        <SubTitle>이 번역은 000에 의해 번역된 결과입니다.</SubTitle>
        <TextBox border="black">
          {textInput || "변역 결과가 표시됩니다."}
        </TextBox>
      </ContainerStyled>
    </ContainerStyled>
  );
}

Translation.propTypes = {
  textInput: PropTypes.string,
  handleTranslate: PropTypes.func.isRequired,
};

Translation.defaultProps = {
  textInput: "",
};
