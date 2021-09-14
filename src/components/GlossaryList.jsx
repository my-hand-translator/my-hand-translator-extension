import React from "react";
import PropTypes from "prop-types";
import { BsArrowRight } from "react-icons/bs";

import ContainerStyled from "./shared/Container";
import Button from "./shared/Button";
import Col from "./shared/Col";

function GlossaryList({ glossaries, buttonText, onButtonClick }) {
  return (
    <>
      {Object.keys(glossaries).map((text) => {
        return (
          <ContainerStyled id={text} justify="spaceEvenly" align="itemCenter">
            <Col name="text" grid="col2">
              {text}
            </Col>
            <p>
              <BsArrowRight />
            </p>
            <Col name="translation" grid="col2">
              {glossaries[text]}
            </Col>

            <Col grid="col1">
              <Button
                size="small"
                bgColor="red"
                onClick={() => onButtonClick(text, glossaries[text])}
              >
                {buttonText}
              </Button>
            </Col>
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
