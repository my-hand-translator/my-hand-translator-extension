import React, { useEffect, useRef, useState } from "react";

import Title from "./shared/Title";
import MyTranslation from "./MyTranslation";
import ErrorStyled from "./shared/Error";
import Button from "./shared/Button";

import { styled } from "../config/stitches.config";
import debounce from "../utils/utils";

const HeaderStyled = styled("div", {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: "3em",
});

const TranslationsStyled = styled("div", {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  width: "100%",
});

const FormContent = styled("form", {
  marginBottom: "1em",

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

  useEffect(() => {
    chrome.storage.sync.get(["translations"], (data) => {
      if (chrome.runtime.lastError) {
        setError(chrome.runtime.lastError.message);
      }

      setTranslations(data.translations);
      setSplitIndex(SPLIT_UNIT);
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
      <HeaderStyled>
        <Title>내 번역 기록 보기</Title>
      </HeaderStyled>
      {error && <ErrorStyled>{error}</ErrorStyled>}
      <TranslationsStyled>
        <FormContent>
          <input
            type="text"
            placeholder="검색어를 입력하세요."
            onChange={({ target }) => {
              handleSearchValue(target.value);
            }}
          />
          <Button size="small" type="button" onClick={handleSearchButtonClick}>
            검색
          </Button>
        </FormContent>
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
      </TranslationsStyled>
      {!isSearched && <div ref={observedElement} />}
    </>
  );
}

export default MyTranslations;
