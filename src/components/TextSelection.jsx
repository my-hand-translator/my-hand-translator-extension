import React, { useEffect, useRef, useState } from "react";
import { css, globalCss, styled } from "../config/stitches.config";
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
  maxWidth: "500px",
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
      setTextSelected(document.getSelection().toString().trim());

      if (!isButtonClicked) {
        setBoxPosition({ left: pageX, top: pageY });
      }
    };

    const handleMousedown = () => {
      setIsSelectionEnd(false);
      setIsButtonClicked(false);
    };

    const handleClickOutside = ({ target }) => {
      if (isBoxVisible && !boxRef.current?.contains(target)) {
        setIsBoxVisible(false);
        setIsButtonClicked(false);
        setTextSelected("");
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

  const handleClickTranslate = async ({
    pageX,
    pageY,
    clientX,
    clientY,
    view: { innerHeight, innerWidth },
  }) => {
    setErrorMessage("");
    setIsBoxVisible(true);
    setIsButtonClicked(true);

    const left = clientX / innerWidth < 0.5 ? pageX : pageX - 400;
    const top = clientY / innerHeight < 0.5 ? pageY : pageY - 800;

    setBoxPosition({ left, top });

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

  globalCss(css);

  return (
    user && (
      <PageTranslationContainer ref={boxRef} css={boxPosition} flex="column">
        {isBoxVisible ? (
          <>
            {errorMessage && (
              <ErrorStyled>{JSON.stringify(errorMessage)}</ErrorStyled>
            )}
            <Translation
              originText={textSelected}
              translationResult={translationResult}
              handleClickGoogleTranslate={handleClickGoogleTranslate}
              isOnWebPage
            />
          </>
        ) : (
          textSelected &&
          isSelectionEnd && (
            <Button
              bgColor="lightBlue"
              size="translationButton"
              onMouseDown={handleClickTranslate}
            >
              🖐
            </Button>
          )
        )}
      </PageTranslationContainer>
    )
  );
}
