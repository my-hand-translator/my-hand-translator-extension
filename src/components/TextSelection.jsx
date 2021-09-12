import React, { useEffect, useRef, useState } from "react";
import { styled } from "../config/stitches.config";
import {
  getTranslationResult,
  googleTranslate,
} from "../services/translationService";
import chromeStore from "../utils/chromeStore";
import Button from "./shared/Button";
import ContainerStyled from "./shared/Container";
import ErrorStyled from "./shared/Error";
import Translation from "./Translation";

const PageTranslationContainer = styled(ContainerStyled, {
  position: "absolute",
  backgroundColor: "transparent",
  zIndex: "9999",
});

const initialBoxPosition = {
  left: 0,
  top: 0,
};

export default function TextSelection() {
  const [user, setUser] = useState(null);

  const [boxPosition, setBoxPosition] = useState(initialBoxPosition);
  const [isBoxVisible, setIsBoxVisible] = useState(false);
  const boxRef = useRef();

  const [textSelected, setTextSelected] = useState("");
  const [translationResult, setTranslationResult] = useState({});

  const [isSelectionEnd, setIsSelectionEnd] = useState(false);
  const [isButtonClicked, setIsButtonClicked] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    (async () => {
      const userData = await chromeStore.get("userData");

      setUser(userData);
    })();

    const handleMouseup = ({ pageX, pageY }) => {
      setIsSelectionEnd(true);

      if (!isBoxVisible) {
        setBoxPosition({ left: pageX, top: pageY });
      }

      setTextSelected(document.getSelection().toString().trim());
    };

    const handleMousedown = () => {
      setIsSelectionEnd(false);
    };

    const handleClickOutside = ({ target }) => {
      if (boxRef.current && !boxRef.current.contains(target)) {
        setIsBoxVisible(false);
      }
    };

    document.addEventListener("mouseup", handleMouseup);
    document.addEventListener("mousedown", handleMousedown);
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("mouseup", handleMouseup);
      document.removeEventListener("mousedown", handleMousedown);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isBoxVisible, boxRef]);

  const handleClickTranslate = async () => {
    setErrorMessage("");
    setIsBoxVisible(true);
    setIsButtonClicked(true);

    try {
      const result = await getTranslationResult(user, textSelected);

      setTranslationResult(result);
    } catch (error) {
      setErrorMessage(error);
    }
  };

  const handleClickGoogleTranslate = async () => {
    try {
      const result = await googleTranslate(user, textSelected);

      setTranslationResult(result);
    } catch (error) {
      setErrorMessage(error);
    }
  };

  return (
    user &&
    user.oAuth && (
      <PageTranslationContainer ref={boxRef} css={boxPosition}>
        {isBoxVisible ? (
          <ContainerStyled flex="column">
            {errorMessage && <ErrorStyled>{errorMessage}</ErrorStyled>}
            {isButtonClicked && (
              <Translation
                originText={textSelected}
                translationResult={translationResult}
                handleClickGoogleTranslate={handleClickGoogleTranslate}
                isOnWebPage
              />
            )}
          </ContainerStyled>
        ) : (
          textSelected &&
          isSelectionEnd && (
            <Button onMouseDown={handleClickTranslate}>번역하기</Button>
          )
        )}
      </PageTranslationContainer>
    )
  );
}
