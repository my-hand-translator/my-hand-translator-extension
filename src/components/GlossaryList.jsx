import React from "react";
import PropTypes from "prop-types";

import ContainerStyled from "./shared/Container";
import Button from "./shared/Button";

function GlossaryList({ glossaries, buttonText, onButtonClick }) {
  return (
    <>
      {Object.keys(glossaries).map((text) => {
        return (
          <ContainerStyled id={text} justify="spaceEvenly" align="itemCenter">
            <div name="text">{text} </div>
            <p>{"->"}</p>
            <div name="translation">{glossaries[text]} </div>
            <Button
              size="small"
              onClick={() => onButtonClick(text, glossaries[text])}
            >
              {buttonText}
            </Button>
          </ContainerStyled>
        );
      })}
    </>
  );
}

GlossaryList.propTypes = {
  glossaries: PropTypes.objectOf(PropTypes.string).isRequired,
  buttonText: PropTypes.string.isRequired,
  onButtonClick: PropTypes.func.isRequired,
};

export default GlossaryList;
