import React from "react";
import PropTypes from "prop-types";

import Button from "./shared/Button";
import Container from "./shared/Container";

import { styled } from "../config/stitches.config";

const TranslationsContainer = styled(Container, {
  width: "80%",
  padding: "2em",

  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
  textAlign: "center",

  marginBottom: "1em",
});

const TranslationContent = styled(Container, {
  "& span": {
    marginBottom: "0.5em",
  },

  flex: "1 1 30%",
});

const URLContainer = styled(Container, {
  "& span": {
    marginBottom: "0.5em",
  },

  flex: "1 1 20%",
});

function MyTranslation({ translation, onClick }) {
  return (
    <TranslationsContainer justify="center" align="center">
      <TranslationContent justify="center" align="center" flex="column">
        <span>원문</span>
        <p>{translation.origin}</p>
      </TranslationContent>
      <TranslationContent justify="center" align="center" flex="column">
        <span>번역 결과</span>
        <p>{translation.translated}</p>
      </TranslationContent>
      <URLContainer justify="center" align="center" flex="column">
        <span>URL</span>
        <p>{translation.url}</p>
      </URLContainer>

      <Container justify="center" align="center">
        <Button type="button" size="small" onClick={() => onClick(translation)}>
          삭제
        </Button>
      </Container>
    </TranslationsContainer>
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
