import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import Container from "./shared/Container";

import { styled } from "../config/stitches.config";
import { OTHER_GLOSSARIES } from "../constants/url";

const GlossaryContainer = styled(Container, {
  width: "100%",
  padding: "2em",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
  textAlign: "center",

  "@tabMedium": {
    flexDirection: "column",
  },
});

const LinkStyled = styled(Link, {
  display: "flex",
  color: "$black",
  textDecoration: "none",
  outline: "none",
  margin: "1.5em 0",
});

export default function OtherGlossary({ glossary }) {
  const {
    glossary: { keywords },
  } = glossary;

  return (
    <LinkStyled to={`${OTHER_GLOSSARIES}/${glossary.userEmail}`}>
      <GlossaryContainer justify="spaceAround">
        <Container justify="center">
          <span>{glossary.userEmail}의 용어집</span>
        </Container>

        <Container justify="center">
          <span>
            Keywords:{" "}
            {keywords.length !== 0 &&
              keywords.map((keyword, index) => {
                return (
                  <span key={keyword}>
                    {keyword}
                    {index === keywords.length - 1 ? "" : ", "}
                  </span>
                );
              })}
          </span>
        </Container>
      </GlossaryContainer>
    </LinkStyled>
  );
}

OtherGlossary.defaultProps = {
  glossary: PropTypes.object,
};

OtherGlossary.propTypes = {
  glossary: PropTypes.shape({
    glossary: PropTypes.shape({
      keywords: PropTypes.arrayOf.isRequired,
      updateAt: PropTypes.string,
      wordPairs: PropTypes.objectOf(PropTypes.string),
    }),
    userEmail: PropTypes.string.isRequired,
  }),
};
