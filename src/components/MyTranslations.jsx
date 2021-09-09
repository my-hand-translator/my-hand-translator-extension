import React, { useEffect, useState } from "react";

import Title from "./shared/Title";
import MyTranslation from "./MyTranslation";

import { styled } from "../config/stitches.config";
import ErrorStyled from "./shared/Error";

import mock from "../../mock.json";
import Button from "./shared/Button";

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

const FormStyled = styled("form", {
  marginBottom: "1em",

  "& input": {
    marginRight: "0.5em",
  },
});

function MyTranslations() {
  const [translations, setTranslations] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    chrome.storage.sync.get(["translations"], (data) => {
      if (chrome.runtime.lastError) {
        setError(chrome.runtime.lastError.message);
      }

      setTranslations(data.translations);
    });

    // chrome.storage.sync.set({
    //   translations: mock,
    // });
  }, []);

  // const debounce = (callback, delay) => {
  //   let debounceTimeoutId = null;

  //   return (...args) => {
  //     if (debounceTimeoutId) {
  //       clearTimeout(debounceTimeoutId);

  //       debounceTimeoutId = null;
  //     }

  //     debounceTimeoutId = setTimeout(() => {
  //       callback(...args);
  //     }, delay);
  //   };
  // };

  const handleSearchValue = (value) => {
    setSearchValue(value);
  };

  // const debounceInputEvent = debounce(handleSearchValue, 1000);

  const handleDeleteButton = (translation) => {
    const filteredTranslations = translations.filter((translationToFilter) => {
      return translationToFilter.createAt !== translation.createAt;
    });

    // chrome.storage.sync.set({
    //   translations: filteredTranslations,
    // });

    setTranslations(filteredTranslations);
  };

  const handleSearchButtonClick = (ev) => {
    ev.preventDefault();

    const searchedTranslations = translations.filter((translationToSearch) => {
      return (
        translationToSearch.origin.includes(searchValue) ||
        translationToSearch.translated.includes(searchValue)
      );
    });

    setTranslations(searchedTranslations);
  };

  return (
    <>
      <HeaderStyled>
        <Title>내 번역 기록 보기</Title>
      </HeaderStyled>
      {error && <ErrorStyled>{error}</ErrorStyled>}
      <TranslationsStyled>
        <FormStyled>
          <input
            type="text"
            placeholder="검색어를 입력하세요."
            onChange={({ target }) => {
              handleSearchValue(target.value);
            }}
          />
          <Button
            size="small"
            type="submit"
            onClick={(ev) => handleSearchButtonClick(ev)}
          >
            검색
          </Button>
        </FormStyled>
        {translations.length !== 0 &&
          translations.map((translation) => {
            return (
              <MyTranslation
                key={translation.createAt}
                translation={translation}
                onClick={handleDeleteButton}
              />
            );
          })}
      </TranslationsStyled>
    </>
  );
}

export default MyTranslations;
