import React, { useState } from "react";
import PropTypes from "prop-types";
import { DEFAULT_KEYWORDS } from "../constants/user";
import Button from "./shared/Button";

import ContainerStyled from "./shared/Container";
import { signup } from "../services/userService";
import ErrorStyled from "./shared/Error";

export default function Signup({ handleSignupResult }) {
  const [extraKeywordCount, setExtraKeywordCount] = useState(0);
  const [error, setError] = useState("");

  const handleSubmitForm = async (event) => {
    event.preventDefault();

    const inputs = Array.from(event.target.querySelectorAll("input"));
    const keywords = inputs
      .filter(
        ({ type, value }) =>
          (type.checked || type === "text") && Boolean(value),
      )
      .map(({ value }) => value);

    chrome.storage.sync.get(["userData"], async ({ userData }) => {
      if (chrome.runtime.lastError) {
        return setError(chrome.runtime.lastError.message);
      }

      try {
        const signupResult = await signup(userData, keywords);

        if (signupResult.result === "ok") {
          return handleSignupResult(true);
        }

        handleSignupResult(false);

        return setError(signupResult.result.message);
      } catch (err) {
        return setError(err.message);
      }
    });
  };

  const handleClickAddKeyword = () => {
    setExtraKeywordCount((prev) => prev + 1);
  };

  return (
    <ContainerStyled flex="column" size="medium">
      <ErrorStyled>{error}</ErrorStyled>
      <Button type="button" onClick={handleClickAddKeyword}>
        키워드 추가
      </Button>
      <form onSubmit={handleSubmitForm}>
        <ContainerStyled flex="column">
          {DEFAULT_KEYWORDS.map((keyword) => (
            <label key={keyword} htmlFor="name">
              {keyword}
              <input name="keyword" type="checkbox" value={keyword} />
            </label>
          ))}
          {Array(extraKeywordCount)
            .fill(0)
            .map(() => (
              <input type="text" />
            ))}
          <Button type="submit">키워드 제출 및 회원가입</Button>
        </ContainerStyled>
      </form>
    </ContainerStyled>
  );
}

Signup.propTypes = {
  handleSignupResult: PropTypes.func.isRequired,
};
