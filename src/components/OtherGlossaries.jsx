import React, { useEffect, useRef, useState } from "react";

import Title from "./shared/Title";
import Container from "./shared/Container";
import ErrorStyled from "./shared/Error";
import OtherGlossary from "./OtherGlossary";

import Button from "./shared/Button";

import { getGlossaries } from "../services/glossaryService";
import { styled } from "../config/stitches.config";
import chromeStore from "../utils/chromeStore";
import debounce from "../utils/utils";
import TabContainer from "./shared/TabContainer";

const HeaderContainer = styled(Container, {
  marginBottom: "1em",
});

const GlossaryContainer = styled(Container, {
  width: "100%",
});

const FormContainer = styled(Container, {
  width: "90%",
});

const FormContent = styled("form", {
  marginBottom: "1em",

  "& input": {
    marginRight: "0.5em",
  },
});

const DEFAULT_LIMIT = 5;
const DEBOUNCE_DELAY = 500;

export default function OtherGlossaries() {
  const [error, setError] = useState("");
  const [user, setUser] = useState({});
  const [isSearched, setIsSearched] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [glossaries, setGlossaries] = useState([]);

  const observedElement = useRef();

  useEffect(() => {
    (async () => {
      try {
        const storageUser = await chromeStore.get("userData");

        try {
          const serverGlossaries = await getGlossaries(
            storageUser,
            currentPage,
            DEFAULT_LIMIT,
          );

          setGlossaries([...glossaries, ...serverGlossaries]);
          setUser(storageUser);
        } catch (err) {
          setError(err.message);
        }
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [currentPage]);

  useEffect(() => {
    const handleObserver = (entries) => {
      const target = entries[0];

      const debounceSetSplitIndex = debounce(() => {
        setCurrentPage((prevState) => prevState + 1);
      }, DEBOUNCE_DELAY);

      if (target.isIntersecting) {
        debounceSetSplitIndex(currentPage);
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
  }, []);

  const handleSearchValue = (value) => {
    setSearchValue(value);
  };

  const handleSearchButtonClick = async () => {
    const serverGlossaries = await getGlossaries(
      user,
      currentPage,
      DEFAULT_LIMIT,
      searchValue,
    );

    setGlossaries(serverGlossaries);
    setIsSearched(true);
  };

  return (
    <>
      <HeaderContainer justify="center" align="center">
        <Title>내 번역 기록 보기</Title>
        {error && <ErrorStyled>{error}</ErrorStyled>}
      </HeaderContainer>

      <TabContainer>
        <GlossaryContainer justify="center" align="center" flex="column">
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
          {glossaries.length !== 0 &&
            glossaries.map((glossary) => {
              return <OtherGlossary glossary={glossary}>test</OtherGlossary>;
            })}
        </GlossaryContainer>
        {!isSearched && <div ref={observedElement} />}
      </TabContainer>
    </>
  );
}
