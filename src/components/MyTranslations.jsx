import React, { useEffect, useRef, useState } from "react";
import { shallowEqual, useSelector } from "react-redux";

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
  sendTranslations,
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
  const [page, setPage] = useState(0);
  const [isSearched, setIsSearched] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [error, setError] = useState("");

  const observedElement = useRef();

  const user = useSelector((state) => state.user, shallowEqual);
  const {
    clientId,
    translations: storageTranslations,
    isServerOn,
    tokens: { idToken },
    email,
  } = user;

  useEffect(() => {
    (async () => {
      try {
        if (isServerOn) {
          try {
            sendTranslations(email, idToken, translations);
          } catch (err) {
            setError(err.message);
          }

          return;
        }

        setTranslations(storageTranslations);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, []);

  useEffect(() => {
    const handleObserver = (entries) => {
      const target = entries[0];

      const debounceGetTranslations = debounce(async (value) => {
        if (isServerOn) {
          const params = createTranslationParam(value, SPLIT_UNIT);
          const serverTransitions = await getTranslations(
            email,
            idToken,
            params,
            clientId,
          );

          setTranslations([...translations, ...serverTransitions]);
          setPage(value);
        }
      }, DEBOUNCE_DELAY);

      if (target.isIntersecting) {
        debounceGetTranslations(page + 1);
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
  }, [page, translations]);

  const handleSearchValue = (value) => {
    setSearchValue(value);
  };

  const handleDeleteButton = async (translation) => {
    const filteredTranslations = translations.filter((translationToFilter) => {
      return translationToFilter.nanoId !== translation.nanoId;
    });

    chromeStore.set("userData", {
      ...user,
      translations: filteredTranslations,
    });

    setTranslations(filteredTranslations);
  };

  const handleSearchButtonClick = () => {
    const searchedTranslations = translations.filter((translationToSearch) => {
      return (
        translationToSearch.origin.includes(searchValue) ||
        translationToSearch.translated.includes(searchValue)
      );
    });

    setTranslations(searchedTranslations);
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
              name="검색"
              onClick={handleSearchButtonClick}
            >
              검색
            </Button>
          </FormContent>
        </Container>

        <div className="translation-list">
          {translations.length !== 0 &&
            translations.map((translation) => {
              return (
                <MyTranslation
                  key={translation.nanoId}
                  translation={translation}
                  onClick={handleDeleteButton}
                />
              );
            })}
        </div>
      </TabContainer>

      {!isSearched && <div ref={observedElement} />}
    </>
  );
}

export default MyTranslations;
