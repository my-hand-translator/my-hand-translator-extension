import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import Container from "./shared/Container";

import { styled } from "../config/stitches.config";

const GlossaryContainer = styled(Container, {
  width: "50%",
  padding: "2em",

  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
  textAlign: "center",

  marginBottom: "1.5em",
});

const LinkStyled = styled(Link, {
  color: "$black",
  textDecoration: "none",
  outline: "none",
});

export default function OtherGlossary({ glossary }) {
  const {
    glossary: { keywords },
  } = glossary;

  return (
    <GlossaryContainer justify="center" align="center">
      <LinkStyled to={glossary.userEmail}>
        <Container justify="center" align="center">
          <span>{glossary.userEmail}의 용어집</span>
        </Container>
        <Container justify="center" align="center">
          <span>Keywords : </span>
          {keywords.length !== 0 &&
            keywords.map((keyword, index) => {
              return (
                <span>
                  {keyword}
                  {index === keywords.length - 1 ? "" : ", "}
                </span>
              );
            })}
        </Container>
      </LinkStyled>
    </GlossaryContainer>
  );
}

OtherGlossary.defaultProps = {
  glossary: PropTypes.object,
};

OtherGlossary.propTypes = {
  glossary: PropTypes.shape({
    glossary: PropTypes.shape({
      keywords: PropTypes.arrayOf.isRequired,
      updateAt: PropTypes.string.isRequired,
      wordPairs: PropTypes.objectOf,
    }),
    userEmail: PropTypes.string.isRequired,
  }),
};
