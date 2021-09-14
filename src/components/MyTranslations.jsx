import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import Title from "./shared/Title";
import ErrorStyled from "./shared/Error";
import Button from "./shared/Button";
import Container from "./shared/Container";
import TabContainer from "./shared/TabContainer";
import MyTranslation from "./MyTranslation";

import { styled } from "../config/stitches.config";
import chromeStore from "../utils/chromeStore";
import debounce from "../utils/utils";
import {
  createTranslationParam,
  getTranslations,
  combineTranslations,
} from "../services/translationService";

const FormContent = styled("form", {
  "& input": {
    marginRight: "0.5em",
  },
});

const SPLIT_UNIT = 5;
const DEBOUNCE_DELAY = 500;

function MyTranslations() {
  const [translations, setTranslations] = useState([]);
  const [splitIndex, setSplitIndex] = useState(0);
  const [isSearched, setIsSearched] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [error, setError] = useState("");

  const observedElement = useRef();

  const isServerOn = useSelector((state) => state.user.isServerOn);
  const storageTranslations = useSelector((state) => state.user.translations);
  const idToken = useSelector((state) => state.user.tokens.idToken);
  const email = useSelector((state) => state.user.email);

  useEffect(() => {
    (async () => {
      try {
        if (isServerOn) {
          const params = createTranslationParam(1, 100);
          const serverTransitions = await getTranslations(
            email,
            idToken,
            params,
          );

          const combinedTranslations = combineTranslations(
            storageTranslations,
            serverTransitions,
          );

          setTranslations(combinedTranslations);
          setSplitIndex(SPLIT_UNIT);

          return;
        }

        setTranslations(storageTranslations);
        setSplitIndex(SPLIT_UNIT);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [isServerOn, email, idToken, storageTranslations]);

  useEffect(() => {
    const handleObserver = (entries) => {
      const target = entries[0];

      const debounceSetSplitIndex = debounce((value) => {
        setSplitIndex(value);
      }, DEBOUNCE_DELAY);

      if (target.isIntersecting) {
        debounceSetSplitIndex(splitIndex + SPLIT_UNIT);
      }
    };

    const currentObservedElement = observedElement.current;
    const observer = new IntersectionObserver(handleObserver);

    if (currentObservedElement) {
      observer.observe(currentObservedElement);
    }

    return () => {
      observer.unobserve(currentObservedElement);
    };
  }, [splitIndex]);

  const handleSearchValue = (value) => {
    setSearchValue(value);
  };

  const handleDeleteButton = async (translation) => {
    const filteredTranslations = translations.filter((translationToFilter) => {
      return translationToFilter.nanoId !== translation.nanoId;
    });

    chromeStore.set("translations", filteredTranslations);

    setTranslations(filteredTranslations);
    setSplitIndex(filteredTranslations.length);
  };

  const handleSearchButtonClick = () => {
    const searchedTranslations = translations.filter((translationToSearch) => {
      return (
        translationToSearch.origin.includes(searchValue) ||
        translationToSearch.translated.includes(searchValue)
      );
    });

    setTranslations(searchedTranslations);
    setSplitIndex(searchedTranslations.length);
    setIsSearched(true);
    setSearchValue("");
  };

  return (
    <>
      <Container justify="center" align="itemCenter">
        <Title>내 번역 기록 보기</Title>
      </Container>

      <TabContainer>
        <Container justify="spaceBetween" align="itemCenter">
          <ErrorStyled>{error}</ErrorStyled>

          <FormContent>
            <input
              type="text"
              placeholder="검색어를 입력하세요."
              onChange={({ target }) => {
                handleSearchValue(target.value);
              }}
            />
            <Button
              size="small"
              type="button"
              onClick={handleSearchButtonClick}
            >
              검색
            </Button>
          </FormContent>
        </Container>

        <div className="translation-list">
          {translations.length !== 0 &&
            translations.map((translation, index) => {
              if (index < splitIndex) {
                return (
                  <MyTranslation
                    key={translation.nanoId}
                    translation={translation}
                    onClick={handleDeleteButton}
                  />
                );
              }

              return null;
            })}
        </div>
      </TabContainer>

      {!isSearched && <div ref={observedElement} />}
    </>
  );
}

export default MyTranslations;
