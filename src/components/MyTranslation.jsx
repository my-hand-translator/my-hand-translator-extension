import React from "react";
import PropTypes from "prop-types";
import { styled } from "../config/stitches.config";
import Button from "./shared/Button";

const TranslationStyled = styled("div", {
  width: "80%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "2em",

  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
  textAlign: "center",

  marginBottom: "1em",
});

const TranslationContent = styled("div", {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",

  "& span": {
    marginBottom: "0.5em",
  },

  flex: "1 1 30%",
});

const URLContent = styled("div", {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",

  "& span": {
    marginBottom: "0.5em",
  },

  flex: "1 1 20%",
});

function MyTranslation({ translation, onClick }) {
  return (
    <TranslationStyled>
      <TranslationContent>
        <span>원문</span>
        <p>{translation.origin}</p>
      </TranslationContent>
      <TranslationContent>
        <span>번역 결과</span>
        <p>{translation.translated}</p>
      </TranslationContent>
      <URLContent>
        <span>URL</span>
        <p>{translation.url}</p>
      </URLContent>

      <Button type="button" size="small" onClick={() => onClick(translation)}>
        삭제
      </Button>
    </TranslationStyled>
  );
}

MyTranslation.defaultProps = {
  translation: PropTypes.object,
  onClick: PropTypes.func,
};

MyTranslation.propTypes = {
  translation: PropTypes.shape({
    origin: PropTypes.string.isRequired,
    translated: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }),
  onClick: PropTypes.func,
};

export default MyTranslation;
