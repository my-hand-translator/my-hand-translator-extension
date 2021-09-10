import React, { useEffect, useRef, useState } from "react";

import Title from "./shared/Title";
import MyTranslation from "./MyTranslation";
import ErrorStyled from "./shared/Error";
import Button from "./shared/Button";
import Container from "./shared/Container";

import { styled } from "../config/stitches.config";
import debounce from "../utils/utils";
import {
  createTranslationParam,
  getTranslations,
} from "../services/translationService";

const HeaderContainer = styled(Container, {
  marginBottom: "2em",
});

const TranslationsContainer = styled(Container, {
  width: "100%",
});

const FormContent = styled("form", {
  marginBottom: "1em",

  "& input": {
    marginRight: "0.5em",
  },
});

const FormContainer = styled(Container, {
  width: "90%",
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

  useEffect(() => {
    chrome.storage.sync.get(["userData"], async ({ userData }) => {
      if (chrome.runtime.lastError) {
        setError(chrome.runtime.lastError.message);
      }

      if (userData?.isServerOn) {
        const params = createTranslationParam(1, 100);

        try {
          const serverTransitions = await getTranslations(userData, params);

          setTranslations(serverTransitions);
          setSplitIndex(SPLIT_UNIT);
        } catch (err) {
          setError(err.message);
        }

        return;
      }

      chrome.storage.sync.get(["translations"], (data) => {
        if (chrome.runtime.lastError) {
          setError(chrome.runtime.lastError.message);
        }

        setTranslations(data.translations);
        setSplitIndex(SPLIT_UNIT);
      });
    });
  }, []);

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

    if (currentObservedElement) observer.observe(currentObservedElement);

    return () => {
      observer.unobserve(currentObservedElement);
    };
  }, [splitIndex]);

  const handleSearchValue = (value) => {
    setSearchValue(value);
  };

  const handleDeleteButton = (translation) => {
    const filteredTranslations = translations.filter((translationToFilter) => {
      return translationToFilter.nanoId !== translation.nanoId;
    });

    chrome.storage.sync.set({
      translations: filteredTranslations,
    });

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
      <HeaderContainer justify="center" align="center">
        <Title>내 번역 기록 보기</Title>
      </HeaderContainer>
      {error && <ErrorStyled>{error}</ErrorStyled>}
      <TranslationsContainer justify="center" align="center" flex="column">
        <FormContainer justify="end">
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
        </FormContainer>
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
      </TranslationsContainer>
      {!isSearched && <div ref={observedElement} />}
    </>
  );
}

export default MyTranslations;
