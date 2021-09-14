import React from "react";
import PropTypes from "prop-types";

import Button from "./shared/Button";
import Container from "./shared/Container";

import { styled } from "../config/stitches.config";

const TranslationsContainer = styled(Container, {
  padding: "2em",
  margin: "1.5em 0",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
  wordBreak: "break-all",

  "@tabMedium": {
    flexDirection: "column",
  },
});

const FlexColumContainer = styled(Container, {
  "@tabMedium": {
    flexDirection: "column",
  },
});

const EllipsisContent = styled("div", {
  overflow: "hidden",
  textOverflow: "ellipsis",
});

function MyTranslation({ translation, onClick }) {
  return (
    <TranslationsContainer
      justify="center"
      align="itemCenter"
      alignContent="start"
    >
      <div>
        <FlexColumContainer>
          <Container alignContent="start">
            <p>{translation.origin}</p>
          </Container>

          <Container alignContent="start">
            <p>{translation.translated}</p>
          </Container>
        </FlexColumContainer>

        <Container>
          <EllipsisContent>
            <a href={translation.url}>{translation.url}</a>
          </EllipsisContent>
        </Container>
      </div>

      <Container justify="center" align="itemCenter">
        <Button
          type="button"
          size="small"
          bgColor="red"
          onClick={() => onClick(translation)}
        >
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
